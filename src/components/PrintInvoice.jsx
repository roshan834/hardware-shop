const PrintInvoice = ({
  cart,
  subtotal,
  gst,
  total,
  customer,
  phone
}) => {
  const invoiceNo = `INV${Date.now()}`

  const customerName = customer || "Walk-In Customer"
  const customerPhone = phone || "-"

  const print = () => {
    const win = window.open("", "", "width=800,height=900")

    win.document.write(`
      <html>
      <head>
        <title>Tax Invoice</title>

        <div class="row">
          <div>
            <b>Customer:</b> ${customerName}
            <br/>
            <b>Phone:</b> ${customerPhone}
          </div>

          <div>
            Invoice No: <b>${invoiceNo}</b>
            <br/>
            ${new Date().toLocaleString()}
          </div>
        </div>

        <style>
          *{
            margin:0;
            padding:0;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
          }

          body{
            padding:20px;
            color:#000;
            font-size:13px;
          }

          .invoice{
            max-width:800px;
            margin:auto;
          }

          .center{
            text-align:center;
          }

          .shop-name{
            font-size:28px;
            font-weight:bold;
          }

          .address{
            margin-top:5px;
            line-height:1.7;
          }

          hr{
            border:none;
            border-top:1px dashed #999;
            margin:12px 0;
          }

          .row{
            display:flex;
            justify-content:space-between;
            margin-bottom:8px;
          }

          table{
            width:100%;
            border-collapse:collapse;
            margin-top:15px;
          }

          th{
            border-bottom:2px solid #000;
            padding:10px;
            text-align:left;
          }

          td{
            border-bottom:1px solid #ddd;
            padding:10px;
          }

          .right{
            text-align:right;
          }

          .summary{
            margin-top:20px;
          }

          .summary-row{
            display:flex;
            justify-content:space-between;
            margin-bottom:10px;
          }

          .grand-total{
            font-size:22px;
            font-weight:bold;
            border-top:2px solid #000;
            padding-top:10px;
            margin-top:10px;
          }

          .footer{
            margin-top:25px;
            font-size:12px;
            line-height:1.8;
          }
        </style>

      </head>

      <body>

        <div class="invoice">

          <div class="center">
            <div class="shop-name">
              NEELKANTH ENTERPRISES
            </div>

            <div class="address">
              Kandivali West, Mumbai<br/>
              Mobile: 8286357442<br/>
              Email: contact.webtechgenz@gmail.com
            </div>

            <hr>

            <h2>TAX INVOICE</h2>
          </div>

          <div class="row">
            <div>
              Invoice No:
              <b>${invoiceNo}</b>
            </div>

            <div>
              ${new Date().toLocaleString()}
            </div>
          </div>

          <hr>

          <table>

            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th class="right">Rate</th>
                <th class="right">Amount</th>
              </tr>
            </thead>

            <tbody>

              ${cart
                .map(
                  (item) => `
                  <tr>
                    <td>${item.product_name}</td>

                    <td>${item.qty}</td>

                    <td class="right">
                      ₹${item.selling_price}
                    </td>

                    <td class="right">
                      ₹${(
                        item.qty *
                        item.selling_price
                      ).toFixed(2)}
                    </td>
                  </tr>
                `
                )
                .join("")}

            </tbody>

          </table>

          <div class="summary">

            <div class="summary-row">
              <span>Subtotal</span>
              <strong>
                ₹${subtotal.toFixed(2)}
              </strong>
            </div>

            <div class="summary-row">
              <span>CGST (9%)</span>
              <strong>
                ₹${(gst / 2).toFixed(2)}
              </strong>
            </div>

            <div class="summary-row">
              <span>SGST (9%)</span>
              <strong>
                ₹${(gst / 2).toFixed(2)}
              </strong>
            </div>

            <div class="summary-row grand-total">
              <span>Grand Total</span>
              <span>
                ₹${total.toFixed(2)}
              </span>
            </div>

          </div>

          <hr>

          <div>
            <b>Total Items:</b> ${cart.length}
            <br/>
            <b>Total Qty:</b>
            ${cart.reduce(
              (sum, item) => sum + item.qty,
              0
            )}
          </div>

          <div class="footer">
            <br/>

            • Goods once sold will not be taken back.<br/>
            • Please retain invoice for warranty.<br/>
            • Thank you for shopping with us.<br/>

            <br/>
            <center>
              <b>NEELKANTH ENTERPRISES</b>
            </center>
          </div>

        </div>

      </body>
      </html>
    `)

    win.document.close()

    setTimeout(() => {
      win.print()
    }, 500)
  }

  return print
}

export default PrintInvoice