import NextImage, { ImageProps } from "next/image";

export function Img({ style, ...props }: ImageProps) {
  return (
    <NextImage style={{ width: "auto", height: "auto", ...style }} {...props} />
  );
}
