// LOGIN
function login() {
  let user = document.getElementById("user").value;
  let pass = document.getElementById("pass").value;

  if (user !== "" && pass !== "") {
    localStorage.setItem("user", user);
    window.location = "order.html";
  } else {
    document.getElementById("msg").innerText = "❌ Enter details";
  }
}

// SHOW USER
window.onload = function() {
  if (document.getElementById("welcome")) {
    document.getElementById("welcome").innerText =
      "Welcome, " + localStorage.getItem("user");
  }
};

// UPDATE TIN COUNT AND COST (live)
function updateTinCountAndCost() {
  let qty = document.getElementById("qty").value;
  let tins = qty * 15;
  let cost = qty * 500;   // ₹500 per unit
  document.getElementById("tinCount").innerText = tins;
  document.getElementById("totalCost").innerText = cost;
}

// PLACE ORDER (send qty; server will compute cost)
function placeOrder() {
  let name = document.getElementById("name").value;
  let address = document.getElementById("address").value;
  let oil = document.getElementById("oil").value;
  let qty = document.getElementById("qty").value;

  if (name == "" || address == "" || qty == "") {
    document.getElementById("msg").innerText = "❌ Fill all details";
    return;
  }

  document.getElementById("msg").innerText = "⏳ Processing...";

  fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, address, oil, qty })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("msg").innerText = data.message;
    })
    .catch(err => {
      document.getElementById("msg").innerText = "❌ Network error: " + err;
    });
}

// LOAD ORDERS (SELLER) with summary and full details (including tins and cost)
function loadOrders() {
  fetch("/orders")
    .then(res => res.json())
    .then(data => {
      let list = document.getElementById("orders");
      list.innerHTML = "";

      let totalOrders = data.length;
      let totalQty = 0;
      let totalRevenue = 0;

      data.forEach(o => {
        totalQty += parseInt(o.qty) || 0;
        totalRevenue += o.cost || 0;
        let li = document.createElement("li");
        li.className = "order-item";
        li.innerHTML = `
          <strong>👤 ${o.name}</strong><br>
          📍 Address: ${o.address}<br>
          🛒 Booked Items: ${o.oil} (${o.qty} units = ${o.qty * 15} tins)<br>
          💰 Cost: ₹${o.cost || 0}<br>
          📦 Status: ${o.status}
          <hr>
        `;
        list.appendChild(li);
      });

      // Add summary above the list
      let summary = document.createElement("div");
      summary.className = "summary";
      summary.innerHTML = `
        <strong>📊 Summary</strong><br>
        Total Orders: ${totalOrders}<br>
        Total Quantity (units): ${totalQty}<br>
        Total Tins: ${totalQty * 15}<br>
        Total Revenue: ₹${totalRevenue}
      `;
      list.parentNode.insertBefore(summary, list);
    })
    .catch(err => {
      document.getElementById("orders").innerHTML = "<li>❌ Failed to load orders</li>";
    });
}