import { Detail, showToast, Toast } from "@raycast/api";
import { ReactElement } from "react";
import { DEFAULT_ERROR_TITLE, ErrorText } from "../constants";

export function Error(): ReactElement {
  showToast(Toast.Style.Failure, DEFAULT_ERROR_TITLE);

  return <Detail markdown={ErrorText} />;
}
