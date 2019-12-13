export const lazyLoad = function(params: {
  allArr: any[];
  loadArr: any[];
  index: number;
  long: number;
  finished: boolean;
}) {
  const { allArr, loadArr, index, long } = JSON.parse(JSON.stringify(params));
  let cutArr = [...allArr].splice(index, long);
  params.loadArr = [...loadArr, ...cutArr];
  if (allArr.length - loadArr.length < long) {
    params.finished = true;
    return params;
  }
  params.index = index + long;
  return params;
};
