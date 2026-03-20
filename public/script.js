// LOGIN
function login(){
  let user=document.getElementById("user").value;
  let pass=document.getElementById("pass").value;

  if(user!=="" && pass!==""){
    localStorage.setItem("user",user);
    window.location="order.html";
  }else{
    document.getElementById("msg").innerText="❌ Enter details";
  }
}

// SHOW USER
window.onload=function(){
  if(document.getElementById("welcome")){
    document.getElementById("welcome").innerText=
      "Welcome, "+localStorage.getItem("user");
  }
};

// PLACE ORDER
function placeOrder(){
  let name=document.getElementById("name").value;
  let address=document.getElementById("address").value;
  let oil=document.getElementById("oil").value;
  let qty=document.getElementById("qty").value;

  if(name==""||address==""||qty==""){
    document.getElementById("msg").innerText="❌ Fill all details";
    return;
  }

  document.getElementById("msg").innerText="⏳ Processing...";

  fetch("/order",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({name,address,oil,qty})
  })
  .then(res=>res.json())
  .then(data=>{
    document.getElementById("msg").innerText=data.message;
  })
  .catch(err=>{
    document.getElementById("msg").innerText="❌ Network error: "+err;
  });
}

// LOAD ORDERS (SELLER)
function loadOrders(){
  fetch("/orders")
  .then(res=>res.json())
  .then(data=>{
    let list=document.getElementById("orders");
    list.innerHTML="";
    data.forEach(o=>{
      let li=document.createElement("li");
      li.innerText=`${o.name} - ${o.oil} (${o.qty}) [${o.status}]`;
      list.appendChild(li);
    });
  })
  .catch(err=>{
    document.getElementById("orders").innerHTML="<li>❌ Failed to load orders</li>";
  });
}