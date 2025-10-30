import { Response } from "express";

export const APIResp = {
  Ok: (msh: any, res: Response) => res.status(200).send({ status: true, responsecode: 200, result: msh }),
  successCreate: (result: any, res: Response) => res.status(201).send({ status: true, responsecode: 201, result }),
  accepted: (result: any, res: Response) => res.status(202).send({ status: true, responsecode: 202, result }),
  noContent: (res: Response) => res.status(204).send({ status: true, responsecode: 204, result: null }),
  badRequest: (res: Response) => res.status(400).send({ status: false, responsecode: 400, error: 'Bad request' }),
  unAuthorized: (res: Response) => res.status(401).send({ status: false, responsecode: 401, error: 'Unauthorized' }),
  forbidden: (res: Response) => res.status(403).send({ status: false, responsecode: 403, error: 'Forbidden' }),
  notFound: (res: Response) => res.status(404).send({ status: false, responsecode: 404, error: 'Request not found' }),
  internalServerError: (res: Response, error: any) => res.status(500).send({ status: false, responsecode: 500, error }),
  getErrorResult: (errResp: any, res: Response) => res.status(400).send({ status: false, responsecode: 400, message: errResp }),
  getValidationError: (res: Response, error: any) => res.status(400).send({ status: false, responsecode: 400, error })
};
