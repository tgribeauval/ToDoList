

$(() => {
  $.ajax({
    method: "GET",
    url: "/api/users"
  }).done((users) => {
    for(user of users) {
      $("<div>").text(user.name).appendTo($("body"));
    }
  });;
});

LoadList();
console.log("got here")
function LoadList(){
  $.ajax({
    method:"GET",
    url: "/mylist/items",
    dataType: "json"
  }).done((items) => {
    items.forEach( function(element){

      var createdEl = createElement(element);
      console.log("Got Here Buddy")
      console.log(createdEl)

      $('.thisDude').append(createdEl);

    })
  })
}

function createElement(obj){
  var $article = $('<article>');
  var category = obj.category;
  var content = obj.content;

  var $category = $(`<p>${category}</p>`);
  var $content = $(`<p>${content}</p>`);

  $($article).append($category);
  $($article).append($content);

  return $article

}

