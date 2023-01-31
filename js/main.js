

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
           item.listIngredients()
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
    document.getElementById('product-name').innerText = this.name  
  }

listIngredients () {
  let tableRef = document.getElementById('ingredient-table')

  for(let i = 1; i<tableRef.length;) {//in this case i++ is removed because each iteration of i makes the table smaller by one row. by allowing i to increase by 1, rows of the table would be skipped and left intact.
    //we need to keep first row 
    tableRef.deleteRow(i);
  }

  if(!(this.ingredients == null)){ // loose not strict ==, so will include 0 undefined etc. 
  for(let key in this.ingredients){
    let newRow = tableRef.insertRow(-1)
    let newICell = newRow.insertCell(0)
    let newVCell = newRow.insertCell(1)
    let newIText = document.createTextNode(
      this.ingredients[key].text
    )
    let vegStatus = this.ingredients[key].vegetarian == null ? 'unknown' : this.ingredients[key].vegetarian // ternary to redefine undefined
    let newVText = document.createTextNode(vegStatus)
    newICell.appendChild(newIText)
    newVCell.appendChild(newVText)
    if (vegStatus === 'no'){
      newVCell.classList.add('non-veg-item')//adds a class to element and turn item red in CSS
    } else if (vegStatus === 'unknown' || vegStatus === 'maybe') {
      newVCell.classList.add('unknown-maybe-item')// turn item yellow
    }
  }
  }
}
}