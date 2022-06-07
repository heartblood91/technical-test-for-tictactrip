import fs from 'fs'

type tokenAndCounterOfWordsType = {
  token: string,
  counter_of_words?: number,
}

export type DatabaseType = {
  user: Record<string, tokenAndCounterOfWordsType | undefined>,
}

type DbType = {
  read: () => Promise<DatabaseType>,
  save: (database: DatabaseType) => Promise<void>,
  reset: () => Promise<void>,
}

const getFileUrl = () => 'src/databases/database.json'

const db = {} as DbType

db.read = async () => {
  const file_url = getFileUrl()
  const database: DatabaseType = JSON.parse(await fs.readFileSync(file_url, 'utf-8'))

  return database
}

db.save = async (database: DatabaseType) => {
  const file_url = getFileUrl()
  await fs.writeFileSync(file_url, JSON.stringify(database)) 
}

db.reset = async () => {
  const file_url = getFileUrl()
  await fs.writeFileSync(file_url, JSON.stringify({})) 
}

export {
  db,
}