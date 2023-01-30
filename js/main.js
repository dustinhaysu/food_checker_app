

function getFetch(){
  let inputVal = document.getElementById('barcode').value

if(inputVal.length !== 12){
  alert('Please ensure that barcode is 12 characters.')
  return;
}

  const url = `https://world.openfoodfacts.org/api/v0/product/${inputVal}.json`

  fetch(url)
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        if(data.status === 1){
          const item = new ProductInfo(data.product);
           item.showInfo();
        } else if (data.status === 0) {//use JSON data
          alert(`product ${inputVal} not found. Please try another.`)
        }
        // call additional stuff if product is found
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

class ProductInfo {
  constructor(productData){//I am passing in data.product.product_name
    this.name = productData.product_name
    this.ingredients = productData.ingredients
    this.image = productData.image_url
  }
  
  // testCall() {
  //   console.log(this.ingredients)
  // }// test for return data from fetch

  showInfo() {
    document.getElementById('product-img').src= this.image
    document.getElementById('product-name').innerText = this.name  }
}