const axios = require("axios");

let peticiones = 0,
  bien = 0,
  mal = 0;

function peticion(iter = peticiones) {
  const data = {
    number: "4751080851",
    //text: "" + iter,
    file_name: "t" + iter + ".pdf",
    file: "https://tfclub.pv1.mx/FotoCfdi/jsp/file_upload/download.jsp?id_file=7187804&id_security=997905cc5be7c4b1cf4c5806941c10e78a6f7ce6",
  };

  axios({
    method: "POST",
    url: "http://34.94.169.158:22203/wa-bot",
    data: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })
    .then(({ data }) => {
      if (data.response && data.response.id && data.response.id.id) {
        bien++;
      } else {
        console.log(data);
        mal++;
      }
    })
    .catch((err) => {
      console.log(err);
      mal++;
    })
    .finally(() => {
      peticiones++;
    });
}

setInterval(function () {
  peticion();
  console.log(
    "Peticiones: (" + bien + "/" + peticiones + ") " + mal + " con error."
  );
}, 100);

/*for (let i = 0; i < 50; i++) {
  peticion(i);
}*/
