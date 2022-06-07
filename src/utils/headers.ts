const getOneValueOnHeader = (header_property?: Array<string> | string) => {
  if (Array.isArray(header_property)) {
   return header_property.pop() ?? ''
  } else {
   return header_property ?? ''
  }
}

export {
  getOneValueOnHeader,
}