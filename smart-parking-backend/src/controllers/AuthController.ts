import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { APIResp } from "../utils/apiResponse";
import jwt from "jsonwebtoken";
import { helper } from "../utils/helper";

const SECRET = process.env.JWT_SECRET || "secret";

export class AuthController {
  #repo: UserRepository;

  constructor() {
    this.#repo = new UserRepository();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = helper.getReqValues(req);
      const { email, username, password, role = "operator" } = input;

      const existing = await this.#repo.findByEmail(email);
      if (existing) {
        return APIResp.getErrorResult("Email already exists", res);
      }

      const user = await this.#repo.createUser(email, username, password, role);
      return APIResp.successCreate(
        {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        res
      );
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = helper.getReqValues(req);
      const { email, password } = input;

      const user = await this.#repo.findByEmail(email);
      if (!user) return APIResp.getErrorResult("Invalid credentials", res);

      const isValid = await this.#repo.comparePassword(user, password);
      if (!isValid) return APIResp.getErrorResult("Invalid credentials", res);

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        SECRET,
        { expiresIn: "8h" }
      );

      return APIResp.Ok(
        { token, role: user.role, email: user.email },
        res
      );
    } catch (err) {
      next(err);
    }
  };
}
