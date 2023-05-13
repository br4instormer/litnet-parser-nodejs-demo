import { load } from "cheerio";
import { Book } from "../client/types";

export default class Parser {
  private static _lastPageSelector: string = ".pagination li.last a";
  private static _itemsSelector: string = ".content .book-item";
  private static _bookTitleSelector: string = ".book-title a";
  private static _bookAuthorSelector: string = ".author";
  private static _bookAnnotationContainerSelector: string = ".author-wr";
  private static _bookCategoryItems: string = ".meta-info strong a";
  private static _bookCoverSelecter: string = ".book-img img";
  private static _bookUrl: string = "";
  static pageNumber(body: string): number {
    const $ = load(body);
    const lastPage = $(this._lastPageSelector).text();

    return Number.parseInt(lastPage);
  }

  static books(body: string): Book[] {
    const $ = load(body);
    const items = $(this._itemsSelector);
    const itemsCount = items.length;
    const books: Book[] = Array(itemsCount);

    items.each((index, container) => {
      const $container = $(container);
      const annotationNode = $container
        .find(this._bookAnnotationContainerSelector)
        .get(0)?.nextSibling;

      books[index] = {
        title: $container.find(this._bookTitleSelector).text(),
        author: $container.find(this._bookAuthorSelector).text(),
        annotation: annotationNode ? $(annotationNode).text() : "",
        category: $container
          .find(this._bookCategoryItems)
          .map((_, element) => $(element).text())
          .toArray(),
        imgUrl: $container.find(this._bookCoverSelecter).attr("src") || "",
        url: $container.find(this._bookTitleSelector).attr("href") || "",
      };
    });

    return books;
  }
}
