import fs from 'fs'
import { join } from 'path'
import { homedir } from 'os'

type Primitive = string | number | boolean

export default class Settings<T extends Record<string, Primitive>> {
  private _values : T = {} as any

  private set values(val: T ) {
    this._values = val;

    fs.writeFileSync(
      this.filename,
      JSON.stringify(val, null, 2),
      'utf8'
    )
  }

  private get values(): T {
    return this._values;
  }


  private get filename(): string {
    return join(
      homedir(),
      '.chat-config.json'
    )
  }

  constructor({ defaults }: { defaults: T }) {
    // Create file if not exists
    if (!fs.existsSync(this.filename)) {
      fs.writeFileSync(
        this.filename,
        JSON.stringify(defaults, null, 2),
        'utf8'
      )
    }

    this.values = defaults ?? {} as T
  }

  get(key: keyof T): T[keyof T] {
    return this.values[key]
  }

  set(key: keyof T, value: T[keyof T]): void {
    const data = JSON.parse(fs.readFileSync(this.filename, 'utf-8'));

    this.values = {
      ...data,
      [key]: value
    };
  }
}
