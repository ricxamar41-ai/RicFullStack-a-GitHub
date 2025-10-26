const api = '/api';
async function fetchSummary(){
  const res = await fetch(api + '/summary');
  const data = await res.json();
  document.getElementById('totals').innerText = `Usuarios: ${data.users}, Donaciones totales: $${data.totalDonations.toFixed(2)}`;
}
async function fetchDonations(){
  const res = await fetch(api + '/donations');
  const list = await res.json();
  const ul = document.getElementById('donationList');
  ul.innerHTML = '';
  list.forEach(d=>{
    const li = document.createElement('li');
    li.innerText = `${d.date} — ${d.donor}: $${Number(d.amount).toFixed(2)}`;
    ul.appendChild(li);
  });
}
document.getElementById('donationForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const donor = document.getElementById('donor').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  if(!donor || !amount) return alert('Datos incompletos');
  await fetch('/api/donations',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({donor,amount})
  });
  document.getElementById('donor').value=''; document.getElementById('amount').value='';
  await fetchDonations(); fetchSummary();
});
fetchDonations(); fetchSummary();
