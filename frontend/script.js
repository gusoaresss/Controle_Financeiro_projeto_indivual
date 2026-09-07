const URL_API = "http://localhost:8080/api/registros";

const form = document.getElementById("formFinanca");
const inputId = document.getElementById("registroId");
const valorInput = document.getElementById("valor");
const descricaoInput = document.getElementById("descricao");
const categoriaSelect = document.getElementById("categoria");
const dataInput = document.getElementById("data");
const pagoCheckbox = document.getElementById("pago");
const listaRegistros = document.getElementById("listaRegistros");

let registrosCache = [];


document.addEventListener("DOMContentLoaded", () => {
    carregarCategorias();
    carregarRegistros();
});


async function carregarCategorias() {
    try {
        const resposta = await fetch(`${URL_API}/categorias`);
        const categorias = await resposta.json();

        categoriaSelect.innerHTML = '<option value="">Selecione</option>';

        categorias.forEach(cat => {
            const option = document.createElement("option");

            option.value = cat;
            option.textContent = cat;

            categoriaSelect.appendChild(option);
        });

    } catch (erro) {
        console.error("Erro ao carregar categorias", erro);

        categoriaSelect.innerHTML =
            '<option value="">Erro ao carregar</option>';
    }
}


async function carregarRegistros() {
    try {
        const resposta = await fetch(URL_API);

        registrosCache = await resposta.json();

        renderizarRegistros();

    } catch (erro) {
        console.error("Erro ao carregar registros", erro);
    }
}


form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (Number(valorInput.value) <= 0) {
        alert("O valor deve ser maior que zero!");
        return;
    }

    const tipoSelecionado = document.querySelector(
        'input[name="tipo"]:checked'
    ).value;

    const registro = {
        valor: Number(valorInput.value),
        descricao: descricaoInput.value,
        categoria: categoriaSelect.value,
        dataRegistro: dataInput.value,
        tipo: tipoSelecionado,
        pago: pagoCheckbox.checked
    };

    const id = inputId.value;

    let metodo;
    let url;

    if (id) {
        metodo = "PUT";
        url = `${URL_API}/${id}`;
    } else {
        metodo = "POST";
        url = URL_API;
    }

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registro)
        });

        if (resposta.ok) {
            form.reset();

            inputId.value = "";

            document.getElementById("btnSalvar").textContent =
                "Adicionar registro";

            carregarRegistros();

        } else if (resposta.status === 400) {
            alert(
                "Erro de validação: O Back-end rejeitou os dados enviados."
            );
        }

    } catch (erro) {
        console.error("Erro ao salvar registro", erro);
    }
});


function editarRegistro(id) {
    const registro = registrosCache.find(r => r.id === id);

    if (!registro) {
        return;
    }

    inputId.value = registro.id;
    valorInput.value = registro.valor;
    descricaoInput.value = registro.descricao;
    categoriaSelect.value = registro.categoria;
    dataInput.value = registro.dataRegistro;

    document.querySelector(
        `input[name="tipo"][value="${registro.tipo}"]`
    ).checked = true;

    pagoCheckbox.checked = registro.pago;

    document.getElementById("btnSalvar").textContent =
        "Salvar alterações";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


async function excluirRegistro(id) {
    if (!confirm("Deseja realmente excluir este registro?")) {
        return;
    }

    try {
        const resposta = await fetch(`${URL_API}/${id}`, {
            method: "DELETE"
        });

        if (resposta.ok) {
            carregarRegistros();
        }

    } catch (erro) {
        console.error("Erro ao excluir registro", erro);
    }
}


function renderizarRegistros() {
    listaRegistros.innerHTML = "";

    if (registrosCache.length == 0) {
        listaRegistros.innerHTML =
            `<p class="vazio">Nenhum registro encontrado.</p>`;

        atualizarResumo();

        return;
    }

    registrosCache.forEach(registro => {
        const div = document.createElement("div");

        div.classList.add("registro");

        const partesData = registro.dataRegistro.split("-");

        const dataFormatada =
            `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

        let corValor;

        if (registro.tipo === "Receita") {
            corValor = "#16a34a";
        } else {
            corValor = "#dc2626";
        }

        let situacaoText;

        if (registro.pago) {
            situacaoText = "Pago";
        } else {
            situacaoText = "Pendente";
        }

        let sinal;

        if (registro.tipo === "Receita") {
            sinal = "+";
        } else {
            sinal = "-";
        }

        div.innerHTML = `
            <div class="registro-info">
                <strong>
                    ${registro.descricao}
                    <small>(${situacaoText})</small>
                </strong>

                <span>
                    ${registro.categoria} |
                    ${dataFormatada} |
                    ${registro.tipo}
                </span>
            </div>

            <div
                class="registro-valor"
                style="color: ${corValor}; font-weight: bold;"
            >
                ${sinal} R$ ${registro.valor.toFixed(2).replace(".", ",")}
            </div>

            <div class="acoes">
                <button
                    class="editar"
                    onclick="editarRegistro(${registro.id})"
                >
                    Editar
                </button>

                <button
                    class="excluir"
                    onclick="excluirRegistro(${registro.id})"
                >
                    Excluir
                </button>
            </div>
        `;

        listaRegistros.appendChild(div);
    });

    atualizarResumo();
}


function atualizarResumo() {
    const total = registrosCache.reduce((acc, reg) => {
        if (reg.tipo == "Receita") {
            return acc + reg.valor;
        } else {
            return acc - reg.valor;
        }
    }, 0);

    document.getElementById("totalGastos").textContent =
        `R$ ${total.toFixed(2).replace(".", ",")}`;

    document.getElementById("totalRegistros").textContent =
        registrosCache.length;
}