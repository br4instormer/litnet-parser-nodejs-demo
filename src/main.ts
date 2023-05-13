import { AsyncResultCallback, QueueObject, queue } from "async";
import Client from "./client";
import { AxiosInstance, AxiosRequestConfig } from "axios";
import { QueueParams } from "./types";

const SIMULTANEOUS_DOWNLOADS = 10;
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

const client = Client.create(axiosConfig);
Client.setRetry(client, axiosRetryOptions);

const q = queue<QueueParams>(downloadList, SIMULTANEOUS_DOWNLOADS);
const cb = async <T>(body: T): Promise<void> => console.log(body);

async function main(
  client: AxiosInstance,
  q: QueueObject<QueueParams>,
  cb: AsyncResultCallback<string>
): Promise<void> {
  for (let page = 1; page <= 1; page++) {
    const options = {
      url: "/top/all",
      params: {
        alias: "all",
        sort: "latest",
        page,
      },
    };

    q.push<string>(
      {
        client,
        options,
      },
      cb
    );
  }
}

main(client, q, cb);
