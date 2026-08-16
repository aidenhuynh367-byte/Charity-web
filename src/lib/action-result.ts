export type ActionFailure = {
  code: string;
  message: string;
};

export type ActionFormState = { error?: ActionFailure } | null;

export function actionError(
  code: string,
  message: string,
): ActionFailure {
  return { code, message };
}

export function toActionFailure(
  error: unknown,
  fallbackCode = "UNKNOWN",
): ActionFailure {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error &&
    typeof (error as ActionFailure).code === "string" &&
    typeof (error as ActionFailure).message === "string"
  ) {
    return error as ActionFailure;
  }
  if (error instanceof Error && error.message) {
    return { code: fallbackCode, message: error.message };
  }
  return {
    code: fallbackCode,
    message: "Something went wrong. Please try again.",
  };
}
