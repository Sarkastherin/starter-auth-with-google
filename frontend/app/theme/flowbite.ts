import { createTheme } from "flowbite-react";
export const flowbiteTheme = createTheme({
  darkThemeToggle: {
    root: {
      base: "text-base-500 hover:bg-base-100 focus:ring-base-200 dark:text-base-400 dark:hover:bg-base-700 dark:focus:ring-base-700",
    },
  },
  button: {
    color: {
      light:
        "border-base-300 text-base-900 hover:bg-base-100 focus:ring-base-100 dark:border-base-600 dark:bg-base-800 dark:hover:border-base-600 dark:hover:bg-base-700 dark:focus:ring-base-700",
    },
  },
  textInput: {
    addon:
      "border-base-300 bg-base-200 text-base-900 dark:border-base-600 dark:bg-base-600 dark:text-base-400",
    field: {
      icon: {
        svg: "text-base-500 dark:text-base-400",
      },
      rightIcon: {
        svg: "text-base-500 dark:text-base-400",
      },
      input: {
        colors: {
          gray: "border-base-300 bg-base-50 text-base-900 placeholder-base-500 focus:border-primary-500 focus:ring-primary-500 dark:border-base-600 dark:bg-base-700 dark:placeholder-base-400 dark:focus:border-primary-500 dark:focus:ring-primary-500",
        },
      },
    },
  },
  card: {
    root: {
      base: "border-base-200 dark:border-base-700 dark:bg-base-800",
      href: "hover:bg-base-100 dark:hover:bg-base-700",
    },
  },
});
