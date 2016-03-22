// Replaces underscores with blanks and 'plus' with '+'
export default function (dimName) {
  let pat1 = /plus/;
  let pat2 = /_/g;
  let pat3 = /minus/;
  let fixedName = dimName.replace(pat1, '+').replace(pat2, ' ').replace(pat3, '-');
  return fixedName;
}
