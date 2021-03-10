/*
 * Desc: 文本转化类,匹配到例如{{message}}的地方
 */

var openChar = '{',
  endChar = '}',
  ESCAPE_RE = /[-.*+?^${}()|[\]\/\\]/g

let Regex = buildInterpolationRegex();

function buildInterpolationRegex() {
  var open = escapeRegex(openChar),
    end = escapeRegex(endChar)
  return new RegExp(open + open + open + '?(.+?)' + end + '?' + end + end)
}

function escapeRegex(str) {
  return str.replace(ESCAPE_RE, '\\$&')
}

/**
 *  Parse a piece of text, return an array of tokens
 *  token types:
 *  1. plain string
 *  2. object with key = binding key
 *  3. object with key & html = true
 */
function parse(text) {
  if (!Regex.test(text)) return null
  var m, i, token, match, tokens = []
  /* jshint boss: true */
  while (m = text.match(Regex)) {
    i = m.index
    if (i > 0) tokens.push(text.slice(0, i))
    token = {key: m[1].trim()}
    match = m[0]
    token.html =
      match.charAt(2) === openChar &&
      match.charAt(match.length - 3) === endChar
    tokens.push(token)
    text = text.slice(i + m[0].length)
  }
  if (text.length) tokens.push(text)
  return tokens
}

export default {parse};
