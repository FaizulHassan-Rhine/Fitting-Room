/**
 * Build aggregation stages that normalize product documents into one flat stream.
 *
 * Supports these shapes:
 * 1) Domain-wrapped document (new):
 *    {
 *      domains: [
 *        { domain, total_products, products: [ { url, title, ... } ] }
 *      ]
 *    }
 * 2) Root wrapper document (legacy):
 *    { domain, total_products, products: [ { url, title, ... } ] }
 * 3) Flat product document:
 *    { url, title, ... }
 */
function buildFlattenProductsStages() {
  return [
    {
      $addFields: {
        _items: {
          $cond: [
            { $isArray: '$domains' },
            {
              // Flatten domains[].products[] into a single product stream.
              $reduce: {
                input: '$domains',
                initialValue: [],
                in: {
                  $concatArrays: [
                    '$$value',
                    {
                      $map: {
                        input: { $ifNull: ['$$this.products', []] },
                        as: 'p',
                        in: {
                          $mergeObjects: [
                            '$$p',
                            {
                              sourceDomain: '$$this.domain',
                              sourceDomainProductCount: '$$this.total_products',
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              $cond: [
                { $isArray: '$products' },
                '$products',
                [
                  {
                    url: '$url',
                    title: '$title',
                    description: '$description',
                    brandName: '$brandName',
                    brandUrl: '$brandUrl',
                    price: '$price',
                    currency: '$currency',
                    images: '$images',
                  },
                ],
              ],
            },
          ],
        },
      },
    },
    { $unwind: '$_items' },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            '$_items',
            {
              sourceDocumentId: '$_id',
              sourceDomain: { $ifNull: ['$_items.sourceDomain', '$domain'] },
            },
          ],
        },
      },
    },
    {
      $match: {
        // Drop wrappers/empty placeholders after flattening
        title: { $nin: [null, ''] },
        url: { $nin: [null, ''] },
      },
    },
  ];
}

/**
 * Robust conversion of a price-like field into a number for sorting/filtering.
 * Handles:
 * - numbers
 * - strings with commas/currency (e.g. "1,995.00", "BDT 3,795.0")
 * - one-item arrays (takes first item)
 * Falls back to 0 on invalid values.
 */
function buildSafePriceNumberExpr(fieldPath = '$price') {
  return {
    $let: {
      vars: {
        rawPrice: fieldPath,
      },
      in: {
        $let: {
          vars: {
            // If price is an array, take first item. Otherwise use the raw value.
            priceValue: {
              $cond: [
                { $isArray: '$$rawPrice' },
                { $arrayElemAt: ['$$rawPrice', 0] },
                '$$rawPrice',
              ],
            },
          },
          in: {
            $let: {
              vars: {
                rawString: { $toString: '$$priceValue' },
              },
              in: {
                $let: {
                  vars: {
                    // Mongo older versions don't support $regexReplace; remove commas with split+reduce.
                    noComma: {
                      $reduce: {
                        input: { $split: ['$$rawString', ','] },
                        initialValue: '',
                        in: { $concat: ['$$value', '$$this'] },
                      },
                    },
                  },
                  in: {
                    $let: {
                      vars: {
                        // Handles strings like "BDT 3795.0" by taking the last token.
                        lastToken: {
                          $arrayElemAt: [{ $split: ['$$noComma', ' '] }, -1],
                        },
                      },
                      in: {
                        // Try progressively: raw -> noComma -> lastToken -> fallback 0
                        $ifNull: [
                          {
                            $convert: {
                              input: '$$rawString',
                              to: 'double',
                              onError: null,
                              onNull: null,
                            },
                          },
                          {
                            $ifNull: [
                              {
                                $convert: {
                                  input: '$$noComma',
                                  to: 'double',
                                  onError: null,
                                  onNull: null,
                                },
                              },
                              {
                                $ifNull: [
                                  {
                                    $convert: {
                                      input: '$$lastToken',
                                      to: 'double',
                                      onError: null,
                                      onNull: null,
                                    },
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

module.exports = { buildFlattenProductsStages, buildSafePriceNumberExpr };
