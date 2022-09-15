/**
 * Copyright (c) 2016-2022, The Cytoscape Consortium.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the “Software”), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import type cy from 'cytoscape';

function b64ToBlob(b64: string, mimeType: string): Blob {
  const bytes = atob(b64);
  const buff = new ArrayBuffer(bytes.length);
  const buffUint8 = new Uint8Array(buff);

  for (let i = 0; i < bytes.length; i++) {
    buffUint8[i] = bytes.charCodeAt(i);
  }

  return new Blob([buff], {
    type: mimeType,
  });
}

function b64UriToB64(b64uri: string): string {
  const i = b64uri.indexOf(',');
  return b64uri.substring(i + 1);
}

export function output(
  options: cy.ExportJpgStringOptions | cy.ExportJpgBlobOptions | cy.ExportJpgBlobPromiseOptions,
  canvas: HTMLCanvasElement,
  mimeType: string
) {
  const getB64Uri = function getB64Uri() {
    return canvas.toDataURL(mimeType, options.quality);
  };

  switch (options.output) {
    case 'blob-promise':
      return new Promise((resolve, reject) => {
        try {
          canvas.toBlob(
            function (blob) {
              if (blob != null) {
                resolve(blob);
              } else {
                reject(new Error('`canvas.toBlob()` sent a null value in its callback'));
              }
            },
            mimeType,
            options.quality
          );
        } catch (err) {
          reject(err);
        }
      });

    case 'blob':
      return b64ToBlob(b64UriToB64(getB64Uri()), mimeType);

    case 'base64':
      return b64UriToB64(getB64Uri());

    case 'base64uri':
    default:
      return getB64Uri();
  }
}
