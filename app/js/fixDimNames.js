// Replaces underscores with blanks and 'plus' with '+'
export default function (dimName) {
  var pat1 = /plus/;
  var pat2 = /_/g;
  var pat3 = /minus/;
  var fixedName = dimName.replace(pat1, '+').replace(pat2, ' ').replace(pat3, '-');
  return fixedName;
}
