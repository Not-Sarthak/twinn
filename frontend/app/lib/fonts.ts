import localFont from "next/font/local";

export const appleGaramond = localFont({
  src: [
    {
      path: "../../public/apple_garamond/AppleGaramond.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/apple_garamond/AppleGaramond-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/apple_garamond/AppleGaramond-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/apple_garamond/AppleGaramond-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/apple_garamond/AppleGaramond-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/apple_garamond/AppleGaramond-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
  ],
  variable: "--font-apple-garamond",
  display: "swap",
});
