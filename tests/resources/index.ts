import * as path from 'path'

export default function resource(relative: string) {
  return path.resolve(__dirname, './', relative)
}
