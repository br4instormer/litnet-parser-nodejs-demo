import http from "node:http";
import https from "node:https";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import axiosRetry, { IAxiosRetryConfig } from "axios-retry";

export default class Client {
  static create(options: AxiosRequestConfig): AxiosInstance {
    return axios.create({
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true }),
      ...options,
    });
  }

  static setRetry(
    client: AxiosInstance,
    options: IAxiosRetryConfig
  ): AxiosInstance {
    axiosRetry(client, options);

    return client;
  }
}
