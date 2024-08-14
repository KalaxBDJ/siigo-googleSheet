function processInvoices() {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName('Invoices'); //Replace with the Sheet name

  let pageNumber = 1;
  let totalPages = null;
  let startingRow = 2;
  sheet.clear();

  while (true) {
    const response = getEndPointInfo(prop.getProperty('URL_INVOICES'), pageNumber);

    if (!totalPages) {
      totalPages = Math.ceil(response.pagination.total_results / 100);
    }

    SpreadsheetApp.getActiveSpreadsheet().toast(`Getting page ${pageNumber} of ${totalPages}`, 'Progress', -1);

    if (pageNumber % 15 === 0) {
      Logger.log("Waiting to avoid rate limit...");
      Utilities.sleep(5000);
    }

    let expandedInvoices = [];

    response.results.forEach(invoice => {
      const baseInvoice = {
        'id': '',
        'siigo_id': invoice.id,
        'document_id': invoice?.document?.id,
        'number': invoice?.number,
        'name': invoice?.name,
        'date': invoice?.date,
        'customer_id': invoice?.customer?.id,
        'customer_identification': invoice?.customer?.identification,
        'cost_center': invoice?.cost_center,
        'seller': invoice?.seller,
        'total': invoice?.total,
        'mail_status': invoice?.mail?.status,
        'mail_observations': invoice?.mail?.observations,
        'metadata_last_updated': invoice?.metadata?.last_updated,
        'purchase_order_prefix': invoice?.additional_fields?.purchase_order?.prefix,
        'purchase_order_number': invoice?.additional_fields?.purchase_order?.number
      };

      const items = invoice.items || [{ id: null }];
      const payments = invoice.payments || [{ id: null }];
      let idSum = 0

      items.forEach(item => {
        const item_taxes = item.taxes || [{ id: null }];
        item_taxes.forEach(item_tax => {
          payments.forEach(payment => {
            const invoiceData = {
              ...baseInvoice,
              'item_id': item?.id,
              'item_code': item?.code,
              'item_quantity': item?.quantity,
              'item_price': item?.price,
              'item_description': item?.description,
              'item_tax_name': item_tax?.name,
              'item_tax_percentage': item_tax?.percentage,
              'item_tax_value': item_tax?.value,
              'item_total': item?.total,
              'payment_name': payment?.name,
              'payment_value': payment?.value,
            };
            invoiceData.id = `${invoiceData.siigo_id}-${idSum}`;
            expandedInvoices.push(invoiceData);
            idSum = idSum++;
          });
        });
      });
    });

    const headers = Object.keys(expandedInvoices[0]);
    if (pageNumber === 1) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const values = expandedInvoices.map(invoice => Object.values(invoice));
    sheet.getRange(startingRow, 1, values.length, headers.length).setValues(values);

    if (!response._links.next) {
      break;
    }

    startingRow += values.length;
    pageNumber++;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast('Processing completed!', 'Done', 5);
}
