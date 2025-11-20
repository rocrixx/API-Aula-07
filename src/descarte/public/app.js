const API_URL = "/api";

const mapaPontos = {};
const TIPOS_RESIDUO_PADRAO = [
  "plastico",
  "papel",
  "metal",
  "vidro",
  "bateria",
  "organico",
  "eletronico",
];

function selecionarAba(id) {
  const botoes = document.querySelectorAll(".tab-button");
  const abas = document.querySelectorAll(".tab-content");
  botoes.forEach((botao) => {
    botao.classList.toggle("active", botao.dataset.tab === id);
  });
  abas.forEach((aba) => {
    aba.classList.toggle("active", aba.id === id);
  });
}

async function carregarPontosDescarte() {
  try {
    const resposta = await fetch(API_URL + "/pontos-descarte");
    if (!resposta.ok) {
      return;
    }
    const dados = await resposta.json();
    const selectPontoDescarte = document.getElementById("pontoDescarte");
    const selectFiltroPonto = document.getElementById("filtroPonto");

    selectPontoDescarte.innerHTML =
      '<option value="">Selecione um ponto</option>';
    selectFiltroPonto.innerHTML = '<option value="">Todos</option>';
    Object.keys(mapaPontos).forEach((k) => delete mapaPontos[k]);

    dados.forEach((ponto) => {
      const id = ponto.id || ponto._id || ponto.pontoId || "";
      const nome = ponto.nomeLocal || ponto.nome || "Ponto " + id;

      mapaPontos[id] = ponto; 

      const opcao1 = document.createElement("option");
      opcao1.value = id;
      opcao1.textContent = nome;
      selectPontoDescarte.appendChild(opcao1);

      const opcao2 = document.createElement("option");
      opcao2.value = id;
      opcao2.textContent = nome;
      selectFiltroPonto.appendChild(opcao2);
    });
  } catch (e) {}
}

async function enviarPonto(evento) {
  evento.preventDefault();
  const status = document.getElementById("statusPonto");
  status.textContent = "";
  status.className = "status";

  const nomeLocal = document.getElementById("nomeLocal").value.trim();
  const bairro = document.getElementById("bairro").value.trim();
  const tipoLocal = document.getElementById("tipoLocal").value;
  const latitude = document.getElementById("latitude").value.trim();
  const longitude = document.getElementById("longitude").value.trim();
  const categoriasMarcadas = Array.from(
    document.querySelectorAll(".categoria-residuo:checked")
  ).map((c) => c.value);

  if (
    !nomeLocal ||
    !bairro ||
    !tipoLocal ||
    !latitude ||
    !longitude ||
    categoriasMarcadas.length === 0
  ) {
    status.textContent = "Preencha todos os campos.";
    status.classList.add("erro");
    return;
  }

  const corpo = {
    nomeLocal,
    bairro,
    tipoLocal,
    categoriasResiduosAceitos: categoriasMarcadas,
    latitude: Number(latitude),
    longitude: Number(longitude),
  };

  try {
    const resposta = await fetch(API_URL + "/pontos-descarte", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corpo),
    });
    if (resposta.ok) {
      status.textContent = "Ponto de descarte cadastrado com sucesso.";
      status.classList.add("ok");
      document.getElementById("formPonto").reset();
      carregarPontosDescarte();
    } else {
      status.textContent = "Erro ao cadastrar ponto.";
      status.classList.add("erro");
    }
  } catch (e) {
    status.textContent = "Erro de comunicação com a API.";
    status.classList.add("erro");
  }
}

async function enviarDescarte(evento) {
  evento.preventDefault();
  const status = document.getElementById("statusDescarte");
  status.textContent = "";
  status.className = "status";

  const nomeUsuario = document.getElementById("nomeUsuario").value.trim();
  const pontoId = document.getElementById("pontoDescarte").value;
  const tipoResiduo = document.getElementById("tipoResiduo").value;
  const dataDescarte = document.getElementById("dataDescarte").value;

  if (!nomeUsuario || !pontoId || !tipoResiduo || !dataDescarte) {
    status.textContent = "Preencha todos os campos.";
    status.classList.add("erro");
    return;
  }

  const corpo = {
    nomeUsuario,
    pontoId: Number(pontoId),
    tipoResiduo,
    data: dataDescarte,
  };

  try {
    const resposta = await fetch(API_URL + "/registros-descarte", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(corpo),
    });
    if (resposta.ok) {
      status.textContent = "Descarte registrado com sucesso.";
      status.classList.add("ok");
      document.getElementById("formDescarte").reset();
    } else {
      status.textContent = "Erro ao registrar descarte.";
      status.classList.add("erro");
    }
  } catch (e) {
    status.textContent = "Erro de comunicação com a API.";
    status.classList.add("erro");
  }
}

function atualizarTiposResiduoPorPonto() {
  const selectPonto = document.getElementById("pontoDescarte");
  const selectTipo = document.getElementById("tipoResiduo");
  const pontoId = selectPonto.value;

  selectTipo.innerHTML = '<option value="">Selecione</option>';

  let tipos = TIPOS_RESIDUO_PADRAO;

  if (pontoId && mapaPontos[pontoId]) {
    const categorias = mapaPontos[pontoId].categoriasResiduosAceitos;
    if (Array.isArray(categorias) && categorias.length > 0) {
      tipos = categorias;
    }
  }

  tipos.forEach((tipo) => {
    const opt = document.createElement("option");
    opt.value = tipo;
    opt.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    selectTipo.appendChild(opt);
  });
}

function montarQueryHistorico() {
  const params = new URLSearchParams();
  const nomeUsuario = document.getElementById("filtroUsuario").value.trim();
  const tipoResiduo = document.getElementById("filtroTipoResiduo").value;
  const dataInicio = document.getElementById("filtroDataInicio").value;
  const dataFim = document.getElementById("filtroDataFim").value;
  const pontoId = document.getElementById("filtroPonto").value;

  if (nomeUsuario) {
    params.append("nomeUsuario", nomeUsuario);
  }
  if (tipoResiduo) {
    params.append("tipoResiduo", tipoResiduo);
  }
  if (pontoId) {
    params.append("pontoId", pontoId);
  }

  const data = dataInicio || dataFim;
  if (data) {
    params.append("data", data);
  }

  const sufixo = params.toString();
  if (!sufixo) {
    return "";
  }
  return "?" + sufixo;
}

async function buscarHistorico(evento) {
  evento.preventDefault();
  const status = document.getElementById("statusHistorico");
  status.textContent = "";
  status.className = "status";

  const corpoTabela = document.getElementById("tabelaHistoricoBody");
  corpoTabela.innerHTML = "";

  try {
    const query = montarQueryHistorico();
    const resposta = await fetch(API_URL + "/registros-descarte" + query);
    if (!resposta.ok) {
      status.textContent = "Erro ao buscar histórico.";
      status.classList.add("erro");
      return;
    }
    const dados = await resposta.json();
    if (!dados || dados.length === 0) {
      status.textContent = "Nenhum registro encontrado.";
      return;
    }
    dados.forEach((registro) => {
      const linha = document.createElement("tr");
      const data = registro.data
        ? new Date(new Date(registro.data).getTime() + (new Date().getTimezoneOffset() * 60000)).toLocaleDateString("pt-BR")
        : "";
      const tipo = registro.tipoResiduo || "";
      const local =
        registro.nomePonto ||
        registro.pontoNome ||
        registro.ponto ||
        registro.pontoId ||
        "";
      const usuario = registro.nomeUsuario || "";
      const colData = document.createElement("td");
      const colTipo = document.createElement("td");
      const colLocal = document.createElement("td");
      const colUsuario = document.createElement("td");
      colData.textContent = data;
      colTipo.textContent = tipo;
      colLocal.textContent = local;
      colUsuario.textContent = usuario;
      linha.appendChild(colData);
      linha.appendChild(colTipo);
      linha.appendChild(colLocal);
      linha.appendChild(colUsuario);
      corpoTabela.appendChild(linha);
    });
  } catch (e) {
    status.textContent = "Erro de comunicação com a API.";
    status.classList.add("erro");
  }
}

async function carregarRelatorio() {
  const status = document.getElementById("statusRelatorio");
  status.textContent = "";
  status.className = "status";

  try {
    const resposta = await fetch(API_URL + "/relatorio");
    if (!resposta.ok) {
      status.textContent = "Erro ao carregar relatório.";
      status.classList.add("erro");
      return;
    }

    const dados = await resposta.json();

    const localInfo = dados.localDescarteComMaiorNumeroRegistros;
    let localTexto = "-";
    if (localInfo) {
      if (typeof localInfo === "string") {
        localTexto = localInfo;
      } else if (localInfo.nomeLocal) {
        localTexto = localInfo.nomeLocal;
      } else if (localInfo.nome) {
        localTexto = localInfo.nome;
      } else {
        localTexto = JSON.stringify(localInfo);
      }
    }
    document.getElementById("relLocal").textContent = localTexto;

    document.getElementById("relTipoResiduo").textContent =
      dados.tipoResiduoMaisFrequente || "-";

    const media = dados.mediaDescartesPorDiaUltimos30;
    document.getElementById("relMedia").textContent =
      media != null ? Number(media).toFixed(2) : "-";

    document.getElementById("relUsuarios").textContent =
      dados.numeroTotalUsuarios != null ? dados.numeroTotalUsuarios : "-";

    document.getElementById("relPontos").textContent =
      dados.totalPontosDescarte != null ? dados.totalPontosDescarte : "-";

    if (
      dados.variacaoPercentualVolumeDescartesUltimos30DiasVsAnterior != null
    ) {
      const valor = Number(
        dados.variacaoPercentualVolumeDescartesUltimos30DiasVsAnterior
      ).toFixed(1);
      document.getElementById("relVariacao").textContent = valor + " %";
    } else {
      document.getElementById("relVariacao").textContent = "-";
    }
  } catch (e) {
    status.textContent = "Erro de comunicação com a API.";
    status.classList.add("erro");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const botoes = document.querySelectorAll(".tab-button");
  botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      const id = botao.dataset.tab;
      selecionarAba(id);
      if (id === "tab-descarte" || id === "tab-historico") {
        carregarPontosDescarte();
      }
      if (id === "tab-relatorios") {
        carregarRelatorio();
      }
    });
  });

  const formPonto = document.getElementById("formPonto");
  const formDescarte = document.getElementById("formDescarte");
  const formHistorico = document.getElementById("formFiltroHistorico");
  const botaoRelatorio = document.getElementById("btnAtualizarRelatorio");
  const selectPontoDescarte = document.getElementById("pontoDescarte");

  formPonto.addEventListener("submit", enviarPonto);
  formDescarte.addEventListener("submit", enviarDescarte);
  formHistorico.addEventListener("submit", buscarHistorico);
  botaoRelatorio.addEventListener("click", carregarRelatorio);
  selectPontoDescarte.addEventListener("change", atualizarTiposResiduoPorPonto);

  carregarPontosDescarte();
});
