(function () {
  /**
   * Endereço do backand ficticio
   */
  var endpoint = "http://localhost:7000/contacts";

  /**
   * Interface do usuario, todos os botões e inputs
   */
  var ui = {
    filds: document.querySelectorAll("input"),
    id: document.querySelector("#id"),
    name: document.querySelector("#name"),
    email: document.querySelector("#email"),
    phone: document.querySelector("#phone"),
    zip: document.querySelector("#zip"),
    address: document.querySelector("#address"),
    district: document.querySelector("#district"),
    city: document.querySelector("#city"),
    state: document.querySelector("#state"),
    number: document.querySelector("#number"),

    buttonAdd: document.querySelector(".btn-add"),
    buttonEdit: document.querySelector(".btn-edit"),
    buttonCancel: document.querySelector(".btn-cancel"),
    buttonSearch: document.querySelector(".btn-search"),
    search: document.querySelector("#search"),

    tableContacts: document.querySelector(".table-contacts tbody"),
    tableHead: document.querySelector(".table-contacts thead"),

    orderIdAsc: document.querySelector("#orderIdAsc"),
    orderIdDesc: document.querySelector("#orderIdDesc"),
    orderNameAsc: document.querySelector("#orderNameAsc"),
    orderNameDesc: document.querySelector("#orderNameDesc"),
  };

  /**
   * Função que busca o CEP na API ViaCEP
   */
  var getZip = function () {
    if (ui.zip.value.length < 8) {
      ui.zip.classList.add("invalid");
      ui.state.value = "";
      ui.district.value = "";
      ui.city.value = "";
      ui.address.value = "";
      ui.zip.value = "";
    } else {
      onlyNumbers();
      var url = `https://viacep.com.br/ws/${ui.zip.value}/json/`;

      var config = {
        method: "GET",
        headers: new Headers({
          "Content-type": "application/json",
        }),
      };
      fetch(url, config)
        .then(function (resp) {
          return resp.json();
        })
        .then(getZipSuccess)
        .catch(genericError)
        .catch(genericError);
    }
  };

  var getZipSuccess = function (zipResp) {
    if (zipResp.erro) {
      ui.zip.classList.add("invalid");
    } else {
      ui.address.value = zipResp.logradouro;
      ui.district.value = zipResp.bairro;
      ui.city.value = zipResp.localidade;
      ui.state.value = zipResp.uf;
      ui.zip.value = zipResp.cep;
    }
  };
  /**
   * função que retira qualquer caracter que nao seja numero
   */
  var onlyNumbers = function () {
    ui.zip.value = ui.zip.value.replace(/\D+/g, "");
  };

  /**
   * Funçãioq que valida as informação digitadas pelo ususario e encaminha para criar ou editar os dados
   * @param {evento} evento do clique do mouse sobre o botão
   */
  var validateFilds = function (e) {
    e.preventDefault();
    var { action } = e.target.dataset;

    var contact = {
      name: null,
      phone: null,
      email: null,
      zip: null,
      number: null,
    };

    const testName = /^\D+$/;
    const testePhone = /^\(?[0-9]{1,3}\)?\s?[0-9]?\s?[0-9]{3,4}\-?\s?[0-9]{4}$/;
    const testEmail = /^[A-z0-9\.\$]{1,}\@[A-z0-9\.\$]{1,}\.([A-z]){1,3}?$/;
    const testZip = /^[0-9]{5}\-?[0-9]{3}$/;
    const testNumber = /\d+/;

    if (validate(testName, ui.name) === true) {
      contact.name = ui.name.value;
    }
    if (validate(testePhone, ui.phone) === true) {
      contact.phone = ui.phone.value;
    }
    if (validate(testEmail, ui.email) === true) {
      contact.email = ui.email.value;
    }
    if (validate(testZip, ui.zip) === true) {
      getZip();
      contact.zip = ui.zip.value;
      contact.address = ui.address.value;
      contact.district = ui.district.value;
      contact.city = ui.city.value;
      contact.state = ui.state.value;
    }
    if (validate(testNumber, ui.number) === true) {
      contact.number = ui.number.value;
    }
    if (
      contact.name != null &&
      contact.phone != null &&
      contact.email != null &&
      contact.zip != null &&
      contact.number != null
    ) {
      if (action == "add") {
        addContact(contact);
      } else {
        contact.id = ui.id.value;
        editContact(contact);
      }
    }
  };

  /**
   * Fução que valida todos os regex
   * @param {*} reg regex validador
   * @param {*} input informação digitada pelo usuario
   */
  var validate = function (reg, input) {
    if (!reg.test(input.value)) {
      input.classList.add("invalid");
      input.placeholder = "Inválido";
      input.focus();
    } else {
      input.classList.remove("invalid");
      return true;
    }
  };

  /**
   *  Função que recebe o contato e o adiciona no servidor
   * @param {*} err erro recebido no catch de um fetch
   */
  var genericError = function (err) {
    console.table("ERROR:", err.message);
  };

  var addContact = function (contact) {
    var config = {
      method: "POST",
      body: JSON.stringify(contact),
      headers: new Headers({
        "Content-type": "application/json",
      }),
    };
    fetch(endpoint, config)
      .then(clearFilds)
      .catch(genericError)
      .finally(() => {});
  };

  /**
  FUnção responsável por limpar os campos após edição / criação
  */
  clearFilds = () => {
    ui.filds.forEach(function (input) {
      console.log(input.value);
      input.value = "";
    });
    ui.buttonAdd.style.display = "inline-block";
    ui.buttonEdit.style.display = "none";
    ui.filds.forEach(function (fild) {
      fild.classList.remove("error");
      fild.classList.remove("invalid");
    });
    getContacts();
  };

  /**
   * Função responsável por ordenar os parametros na tabela
   * @param {*} e evendo do clique para saber qual o modo de ordenação
   */
  let getOrder = function (e) {
    var { action } = e.target.dataset;

    if (action == "orderIdAsc") {
      getContacts("_sort=id,views&_order=asc");
      ui.orderIdAsc.style.display = "none";
      ui.orderIdDesc.style.display = "inline-block";
    }
    if (action == "orderIdDesc") {
      getContacts("_sort=id,views&_order=desc");
      ui.orderIdDesc.style.display = "none";
      ui.orderIdAsc.style.display = "inline-block";
    }

    if (action == "orderNameAsc") {
      getContacts("_sort=name,views&_order=asc");
      ui.orderNameAsc.style.display = "none";
      ui.orderNameDesc.style.display = "inline-block";
    }
    if (action == "orderNameDesc") {
      getContacts("_sort=name,views&_order=desc");
      ui.orderNameDesc.style.display = "none";
      ui.orderNameAsc.style.display = "inline-block";
    }
  };

  /**
   * FUnção responsável por pesquisar os dados na tabela
   * @param {*} e Informação digitada pelo usuario no campo de pesquisa
   */
  let searchContact = function (e) {
    e.preventDefault();
    getContacts(`q=${search.value}`);
  };

  /**
   *  Função responsável por buscar os dados no servidor
   * @param {*} order  Tipo de ordenação desejada
   */
  var getContacts = function (order = "_sort=id,views&_order=asc") {
    var config = {
      method: "GET",
      headers: new Headers({
        "Content-type": "application/json",
      }),
    };
    fetch(`${endpoint}?${order}`, config)
      .then(function (resp) {
        return resp.json();
      })
      .then(getContatcsSuccess)
      .catch(genericError)
      .catch(genericError);
  };

  /**
   *  Lista os contatos na tela do usuario
   * @param {*} contatcs recebe os contatos em formato objeto
   */

  let getContatcsSuccess = (contatcs) => {
    ui.tableContacts.innerHTML = contatcs
      .map(function (contatc) {
        var {
          id,
          name,
          email,
          phone,
          address,
          district,
          city,
          state,
          zip,
          number,
        } = contatc;

        return `<tr>
                   <td>${id}</td>
                   <td>${name}</td>
                    <td>${email}</td>
                    <td>${phone}</td>
                    <td>${address}, N:${number}, ${district},${city}, ${state}. CEP: ${zip}<td>
                    <a href=""  class="pure-button button-warning" data-action="edit" data-id="${contatc.id}">Editar <i
          class="fas fa-user-edit" data-action="edit" data-id="${contatc.id}"></i></a>  
                    <a href="" class="pure-button button-error" data-action="delete" data-id="${contatc.id}">Excluir<i class="fas fa-user-minus" data-action="delete" data-id="${contatc.id}" ></i></a> 
                    </td>

               </tr>`;
      })
      .join("");
  };

  /**
   * Função para buscar um determinado contato pelo id
   * @param {*} id id do contato para editar
   */
  var consultContatc = function (id) {
    var config = {
      method: "GET",
      headers: new Headers({
        "Content-type": "application/json",
      }),
    };
    fetch(`${endpoint}/${id}`, config)
      .then(function (resp) {
        return resp.json();
      })
      .then(showContact)
      .catch(genericError)
      .catch(genericError);
  };

  /**
   * Apresentar o contato na tela de cadastro
   * @param {*} contato contato unico para edição
   */
  let showContact = function (contato) {
    console.table(contato);
    var {
      name,
      email,
      phone,
      id,
      zip,
      address,
      district,
      city,
      state,
      number,
    } = contato;
    ui.name.value = name;
    ui.email.value = email;
    ui.phone.value = phone;
    ui.id.value = id;
    ui.zip.value = zip;
    ui.address.value = address;
    ui.district.value = district;
    ui.city.value = city;
    ui.state.value = state;
    ui.number.value = number;

    ui.buttonAdd.style.display = "none";
    ui.buttonEdit.style.display = "inline-block";
  };

  /**
   * Função para editar o contato
   * @param {*} contato
   */
  var editContact = function (contato) {
    var config = {
      method: "PUT",
      body: JSON.stringify(contato),
      headers: new Headers({
        "Content-type": "application/json",
      }),
    };
    fetch(`${endpoint}/${contato.id}`, config)
      .then(clearFilds)
      .catch(genericError);
  };

  /**
   * Apaga o contato no servidor
   * @param {*} id  Recebe o id do contato a ser ecolico
   */
  var removeContact = function (id) {
    var config = {
      method: "delete",
      headers: new Headers({
        "Content-type": "application/json",
      }),
    };

    fetch(`${endpoint}/${id}`, config).then(getContacts).catch(genericError);
  };

  var hendlerContact = function (e) {
    e.preventDefault();
    var { action, id } = e.target.dataset;

    if (action == "edit") {
      consultContatc(id);
    }
    if (action == "delete") {
      removeContact(id);
    }
  };

  /**
   * Botão para limpar a tela do usuario
   * @param {*} e envento do click no mouse
   */
  var cancelOperation = function (e) {
    e.preventDefault();
    clearFilds();
  };

  /**
   * FUnção que fica iniciada e starta o funcionamento do sistema
   */
  var init = (function () {
    getContacts();

    ui.tableContacts.onclick = hendlerContact;
    ui.tableHead.onclick = getOrder;

    ui.buttonAdd.onclick = validateFilds;
    ui.buttonEdit.onclick = validateFilds;
    ui.buttonCancel.onclick = cancelOperation;
    ui.buttonSearch.onclick = searchContact;
    ui.zip.onblur = getZip;
    ui.zip.oninput = onlyNumbers;
    ui.search.oninput = searchContact;
  })();
})();
