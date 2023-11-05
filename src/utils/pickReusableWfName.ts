export const pickReusableWfName = (str: string) =>
  str.match(/.*\/.*\/\.github\/workflows\/(.*)\.ya?ml@.*/)?.[1]
