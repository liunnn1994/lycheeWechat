import Taro from "@tarojs/taro";

export const message = function(
  title: string,
  icon?: "loading" | "success" | "none",
  duration?: number,
  image?: string,
  mask?: boolean
) {
  if (duration === undefined) duration = 1500;
  return Taro.showToast({
    title,
    icon,
    mask,
    image,
    duration
  });
};
