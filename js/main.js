// https://world.openfoodfacts.org/

let inputVal = ''

//***************quagga****************** */

Quagga.decodeSingle({
  inputStream : {
    name : "Live",
    type : "imageStream",
    target: document.querySelector('#scanner')  // Or '#yourElement' (optional)
  },
  decoder : {
    readers: [
      'upc_reader'
    ]
  },
  locator: {
    halfSample: true,
    patchSize: "large", // x-small, small, medium, large, x-large
    debug: {
      showCanvas: false,
      showPatches: false,
      showFoundPatches: false,
      showSkeleton: false,
      showLabels: false,
      showPatchLabels: false,
      showRemainingPatchLabels: false,
      boxFromPatches: {
        showTransformed: false,
        showTransformedBox: false,
        showBB: false
      }
    }
  }

  
}, function(err) {
    if (err) {
        console.log(err);
        return
    }
    console.log("Initialization finished. Ready to start");
    Quagga.start();
    Quagga.onDetected(data => {
      console.log(data.codeResult.code);
      inputVal = data.codeResult.code;
      getFetch();
      Quagga.stop();
      
    });
});


document.getElementById('button').addEventListener('click', event => {
  inputVal = document.getElementById('barcode').value
  getFetch();
  console.log('party time')
})

//************************************* */

function getFetch(){
  console.log(inputVal)

if(inputVal.length !== 12){
  alert('Please ensure that barcode is 12 characters.')
  return;
}

  const url = `https://world.openfoodfacts.org/api/v0/product/${inputVal}.json`

  console.log(url)

  fetch(url) // fetch object 
      .then(res => res.json()) // parse response as JSON
      .then(data => {
        console.log(data)
        if(data.status === 1){// call additional stuff if product is found
          const item = new ProductInfo(data.product);
          //item.testCall();
          item.showInfo();
          item.listAllergens();
           item.listIngredients();
           item.listInfo();
           item.servingsPerCal();
        } else if (data.status === 0) {//use JSON data
          alert(`product ${inputVal} not found. Please try another.`)
        }
        
      })
      .catch(err => {
          console.log(`error ${err}`)
      });
}

class ProductInfo {
  constructor(productData){//I am passing in data
    this.name = productData.product_name
    this.ingredients = productData.ingredients
    this.image = productData.image_url
    this.allergens = productData.allergens_hierarchy
    this.info = productData.nutrient_levels_tags
    this.servingSize = productData.serving_size
    this.calorie = productData.nutriments['energy-kcal_serving']
  }
  
  // testCall() {
  //   console.log(this.allergens)
  // }// test for return data from fetch

  showInfo() {
    document.getElementById('product-img').src= this.image
    document.getElementById('product-name').innerText = this.name  
  }

listIngredients () {
  let tableRef = document.getElementById('ingredient-table')
//in this case i++ is removed because each iteration of i makes the table smaller by one row. by allowing i to increase by 1, rows of the table would be skipped and left intact.
//we need to keep first row 
  for(let i = 1; i<tableRef.rows.length;) {
    tableRef.deleteRow(i);
    console.log(tableRef.length)
  }

  if(!(this.ingredients == null)){ // loose not strict ==, so will include 0 undefined etc. 
   let table = document.getElementById('ingredient-table')
    table.style.display = 'table';
    document.querySelector('p').innerHTML = ''
  for(let key in this.ingredients){
    let newRow = tableRef.insertRow(-1)
    let newICell = newRow.insertCell(0)
    let newVCell = newRow.insertCell(1)
    let newVeganCell = newRow.insertCell(2)
    let newIText = document.createTextNode(
      this.ingredients[key].text
    )

    let vegStatus = this.ingredients[key].vegetarian == null ? '---' : this.ingredients[key].vegetarian // ternary to redefine undefined

    let veganStatus = this.ingredients[key].vegan == null ? '---' : this.ingredients[key].vegan

    let newVText = document.createTextNode(vegStatus)
    let newVeganText = document.createTextNode(veganStatus)

    newICell.appendChild(newIText)
    newVCell.appendChild(newVText)
    newVeganCell.appendChild(newVeganText)
// vegetarian status styling
    if (vegStatus === 'no'){
      newVCell.classList.add('non-veg-item')//adds a class to element and turn item red in CSS
    } else if (vegStatus === 'unknown' || vegStatus === 'maybe') {
      newVCell.classList.add('unknown-maybe-item')// turn item yellow
    }
//vegan status styling
    if (veganStatus === 'no'){
      newVeganCell.classList.add('non-veg-item')//adds a class to element and turn item red in CSS
    } else if (veganStatus === 'unknown' || veganStatus === 'maybe') {
      newVeganCell.classList.add('unknown-maybe-item')// turn item yellow
    }
  }
  }
}

listAllergens () { //generates <li> 
  document.getElementById('allergens').innerHTML = ''
  document.getElementById('allergy').innerHTML = 'Allergens'
  if(this.allergens.length === 0){
    document.getElementById('allergens').innerHTML = 'No Data'
    document.getElementById('allergens').classList.add('unknown-maybe-item')
    document.getElementById('allergens').classList.add('format')
  }else{
  for(let key in this.allergens){
  let newListItem = document.createElement('li');
  let LIText = this.allergens[key].slice(3)
  let newListItemText = document.createTextNode(LIText)
  newListItem.appendChild(newListItemText)
  document.getElementById('allergens').appendChild(newListItem)
  }
  }
}


listInfo () { //generates <li> 
  document.getElementById('info').innerHTML = ''
  document.getElementById('add-info').innerHTML = "Additional Info"
  for(let key in this.info){
  let newListItem = document.createElement('li');
  let LIText = this.info[key].slice(3).split('-').join(' ')
  let newListItemText = document.createTextNode(LIText)
  newListItem.appendChild(newListItemText)
  document.getElementById('info').appendChild(newListItem)
  if(LIText.includes('high')) {
    newListItem.classList.add('non-veg-item')
  }
  if(LIText.includes('moderate')) {
    newListItem.classList.add('unknown-maybe-item')
  }
  }

   

}

servingsPerCal () {
  document.getElementById('calories').innerHTML = `${this.calorie} calories per ${this.servingSize}`
}




}