import { join } from "node:path";
import { AsyncResultCallback, QueueObject, queue } from "async";
import { AxiosInstance, AxiosRequestConfig } from "axios";
import Client from "./client";
import Parser from "./parser";
import { QueueParams } from "./types";
import CSVStorage from "./storage/csv-storage";
import { IStorage } from "./storage/storage-interface";

const SIMULTANEOUS_DOWNLOADS = 10;
const STORAGE_FILENAME = "storage.csv";
const STORAGE_FILEPATH = join(__dirname, STORAGE_FILENAME);
const axiosConfig: AxiosRequestConfig = {
  baseURL: "https://litnet.com/ru",
  responseType: "document",
  withCredentials: true,
  headers: {
    "Accept-Encoding": "gzip, deflate, br",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    Origin: "https://litnet.com",
    "User-Agent":
      "Mozilla/5.0 (X11; Datanyze; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
  },
};

const axiosRetryOptions = {
  retries: 3,
};

const downloadList = async (
  { client, options }: QueueParams,
  cb: Function
): Promise<string> => cb((await client.request(options)).data);

const storage = new CSVStorage(STORAGE_FILEPATH);
const client = Client.create(axiosConfig);
Client.setRetry(client, axiosRetryOptions);

const q = queue<QueueParams>(downloadList, SIMULTANEOUS_DOWNLOADS);
const parseList = async <T>(body: T): Promise<void> => {
  if (!body) {
    return;
  }

  const books = Parser.books(`${body}`);

  storage.append(books);
};
const parsePagesNum = async (
  client: AxiosInstance,
  options: AxiosRequestConfig
) => {
  const body = await downloadList(
    { client, options },
    (body: string): string => body
  );

  return Parser.pageNumber(body);
};

async function main(
  client: AxiosInstance,
  q: QueueObject<QueueParams>,
  cb: AsyncResultCallback<string>,
  storage: IStorage
): Promise<void> {
  const options = {
    url: "/top/all",
    params: {
      alias: "all",
      sort: "latest",
      page: 1,
    },
  };
  const pages = await parsePagesNum(client, options);

  for (let page = 1; page <= pages; page++) {
    q.push<string>(
      {
        client,
        options: {
          ...options,
          params: {
            ...options.params,
            page,
          },
        },
      },
      cb
    );
  }

  await q.drain();
  await storage.store();
}

main(client, q, parseList, storage);
