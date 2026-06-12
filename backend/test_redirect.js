async function test() {
  console.log('Testing redirection...');
  const res = await fetch('http://localhost:5000/john_doe/g-search', {
    redirect: 'manual'
  });
  console.log('Status:', res.status);
  console.log('Location:', res.headers.get('location'));
}

test().catch(err => {
  console.error('Failed:', err.message);
});
