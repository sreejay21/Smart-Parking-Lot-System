import { User } from "../models/User.model";
import bcrypt from "bcrypt";

export class UserRepository {
  async createUser(
    email: string,
    username: string,
    password: string,
    role: "admin" | "operator" | "user" = "operator"
  ) {
    const hashed = await bcrypt.hash(password, 10);
    return User.create({ email, username, password: hashed, role });
  }

  async findByEmail(email: string) {
    return User.findOne({ email });
  }
  async comparePassword(user: any, plain: string) {
    return bcrypt.compare(plain, user.password);
  }
}
