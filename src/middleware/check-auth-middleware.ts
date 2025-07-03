import { Request, Response, NextFunction } from "express";

export const checkLanguageMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { language } = req.body;

    if (language !== 'English') {
      return res.status(403).json({
        status: false,
        statusCode: 403,
        message: "You cannot create a book in a language other than English.",
      });
    }

    // If the language is English, continue
    next();

  } catch (error) {
    return res.status(500).json({
      status: false,
      statusCode: 500,
      message: "Something went wrong during language check.",
    });
  }
};
