import { CookiesProvider } from "react-cookie";
import { AuthSessionProvider } from "./auth-session.provider";
import DrawerContextProvider from "./drawer.provider";
import LandingProvider from "./landing.provider";
import ModuleInfoProvider from "./moduleInfo.provider";
import { SnackbarProvider } from "./snackbar.provider";
import ThemeContextProvider from "./themeContext.provider";
import CourseInfoProvider from "./courseInfo.provider";

function combineComponents(...components) {
  return components.reduce(
    (Accumulated, Current) =>
      ({ children }) =>
        (
          <Accumulated>
            <Current>{children}</Current>
          </Accumulated>
        ),
    ({ children }) => <>{children}</>
  );
}

const providers = [
  CookiesProvider,
  AuthSessionProvider,
  ThemeContextProvider,
  ModuleInfoProvider,
  LandingProvider,
  DrawerContextProvider,
  SnackbarProvider,
  CourseInfoProvider,
];

export const AppContextProvider = combineComponents(...providers);
