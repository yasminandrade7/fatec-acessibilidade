// ── Máscaras ──────────────────────────────────────────────

function mascaraCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascaraCEP(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function mascaraTelefone(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 10) {
    return nums
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return nums
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

document.getElementById('cpf').addEventListener('input', function () {
  this.value = mascaraCPF(this.value);
});

document.getElementById('cep').addEventListener('input', function () {
  this.value = mascaraCEP(this.value);
  if (this.value.replace(/\D/g, '').length === 8) buscarCEP(this.value);
});

document.getElementById('telefone').addEventListener('input', function () {
  this.value = mascaraTelefone(this.value);
});

// ── Busca de CEP via ViaCEP ───────────────────────────────

async function buscarCEP(cep) {
  const numeros = cep.replace(/\D/g, '');
  const spinner = document.getElementById('cep-spinner');
  const erroCep = document.getElementById('erro-cep');

  spinner.classList.remove('hidden');
  erroCep.textContent = '';

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
    const dados = await resp.json();

    if (dados.erro) {
      erroCep.textContent = 'CEP não encontrado.';
    } else {
      document.getElementById('rua').value    = dados.logradouro || '';
      document.getElementById('bairro').value = dados.bairro     || '';
      document.getElementById('cidade').value = dados.localidade || '';
      document.getElementById('estado').value = dados.uf         || '';

      // Limpa erros dos campos preenchidos automaticamente
      ['rua', 'bairro', 'cidade', 'estado'].forEach(id => {
        document.getElementById(`erro-${id}`).textContent = '';
        document.getElementById(id).classList.remove('input-erro');
      });

      // Foca no número após preencher
      document.getElementById('numero-da-residencia').focus();
    }
  } catch {
    erroCep.textContent = 'Erro ao buscar CEP. Verifique sua conexão.';
  } finally {
    spinner.classList.add('hidden');
  }
}

// ── Validação customizada ─────────────────────────────────

function validarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(nums[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  r = (soma * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(nums[10]);
}

function mostrarErro(id, msg) {
  const campo = document.getElementById(id);
  const erro  = document.getElementById(`erro-${id}`);
  if (campo) campo.classList.add('input-erro');
  if (erro)  erro.textContent = msg;
}

function limparErro(id) {
  const campo = document.getElementById(id);
  const erro  = document.getElementById(`erro-${id}`);
  if (campo) campo.classList.remove('input-erro');
  if (erro)  erro.textContent = '';
}

function validarFormulario() {
  let valido = true;

  // Nome
  const nome = document.getElementById('nome').value.trim();
  if (!nome) {
    mostrarErro('nome', 'O nome completo é obrigatório.');
    valido = false;
  } else if (nome.split(' ').filter(p => p).length < 2) {
    mostrarErro('nome', 'Informe nome e sobrenome.');
    valido = false;
  } else {
    limparErro('nome');
  }

  // CPF
  const cpf = document.getElementById('cpf').value;
  if (!cpf) {
    mostrarErro('cpf', 'O CPF é obrigatório.');
    valido = false;
  } else if (!validarCPF(cpf)) {
    mostrarErro('cpf', 'CPF inválido.');
    valido = false;
  } else {
    limparErro('cpf');
  }

  // Data de nascimento
  const data = document.getElementById('data-de-nascimento').value;
  if (!data) {
    mostrarErro('data-de-nascimento', 'A data de nascimento é obrigatória.');
    valido = false;
  } else {
    const nascimento = new Date(data);
    const hoje = new Date();
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    if (nascimento > hoje) {
      mostrarErro('data-de-nascimento', 'Data não pode ser no futuro.');
      valido = false;
    } else if (idade > 120) {
      mostrarErro('data-de-nascimento', 'Data de nascimento inválida.');
      valido = false;
    } else {
      limparErro('data-de-nascimento');
    }
  }

  // Sexo
  const sexo = document.querySelector('input[name="sexo"]:checked');
  if (!sexo) {
    document.getElementById('erro-sexo').textContent = 'Selecione uma opção de sexo.';
    document.querySelector('.radio-fieldset').classList.add('radio-erro');
    valido = false;
  } else {
    document.getElementById('erro-sexo').textContent = '';
    document.querySelector('.radio-fieldset').classList.remove('radio-erro');
  }

  // CEP
  const cep = document.getElementById('cep').value.replace(/\D/g, '');
  if (!cep) {
    mostrarErro('cep', 'O CEP é obrigatório.');
    valido = false;
  } else if (cep.length !== 8) {
    mostrarErro('cep', 'CEP inválido. Digite os 8 dígitos.');
    valido = false;
  } else {
    limparErro('cep');
  }

  // Estado
  const estado = document.getElementById('estado').value.trim();
  if (!estado) {
    mostrarErro('estado', 'O estado é obrigatório.');
    valido = false;
  } else {
    limparErro('estado');
  }

  // Rua
  const rua = document.getElementById('rua').value.trim();
  if (!rua) {
    mostrarErro('rua', 'A rua é obrigatória.');
    valido = false;
  } else {
    limparErro('rua');
  }

  // Número
  const numero = document.getElementById('numero-da-residencia').value.trim();
  if (!numero) {
    mostrarErro('numero-da-residencia', 'O número é obrigatório.');
    valido = false;
  } else {
    limparErro('numero-da-residencia');
  }

  // Bairro
  const bairro = document.getElementById('bairro').value.trim();
  if (!bairro) {
    mostrarErro('bairro', 'O bairro é obrigatório.');
    valido = false;
  } else {
    limparErro('bairro');
  }

  // Cidade
  const cidade = document.getElementById('cidade').value.trim();
  if (!cidade) {
    mostrarErro('cidade', 'A cidade é obrigatória.');
    valido = false;
  } else {
    limparErro('cidade');
  }

  // Telefone
  const tel = document.getElementById('telefone').value.replace(/\D/g, '');
  if (!tel) {
    mostrarErro('telefone', 'O telefone é obrigatório.');
    valido = false;
  } else if (tel.length < 10) {
    mostrarErro('telefone', 'Telefone inválido.');
    valido = false;
  } else {
    limparErro('telefone');
  }

  // E-mail
  const email = document.getElementById('email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    mostrarErro('email', 'O e-mail é obrigatório.');
    valido = false;
  } else if (!emailRegex.test(email)) {
    mostrarErro('email', 'E-mail inválido.');
    valido = false;
  } else {
    limparErro('email');
  }

  // Termos
  const termos = document.getElementById('termos').checked;
  const erroTermos = document.getElementById('erro-termos');
  const termosWrapper = document.getElementById('termos-wrapper');
  if (!termos) {
    erroTermos.textContent = 'Você precisa aceitar os termos para continuar.';
    termosWrapper.classList.add('termos-erro');
    valido = false;
  } else {
    erroTermos.textContent = '';
    termosWrapper.classList.remove('termos-erro');
  }

  return valido;
}

// ── Limpar erro ao corrigir campo ─────────────────────────

const camposTexto = ['nome', 'cpf', 'data-de-nascimento', 'cep', 'estado',
                     'rua', 'numero-da-residencia', 'bairro', 'cidade',
                     'telefone', 'email'];

camposTexto.forEach(id => {
  const campo = document.getElementById(id);
  if (campo) {
    campo.addEventListener('input', () => limparErro(id));
    campo.addEventListener('blur',  () => limparErro(id));
  }
});

document.getElementById('termos').addEventListener('change', function () {
  const erroTermos  = document.getElementById('erro-termos');
  const termosWrapper = document.getElementById('termos-wrapper');
  if (this.checked) {
    erroTermos.textContent = '';
    termosWrapper.classList.remove('termos-erro');
  }
});

// ── Submit ────────────────────────────────────────────────

// Limpar erro do sexo ao selecionar
document.querySelectorAll('input[name="sexo"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.getElementById('erro-sexo').textContent = '';
    document.querySelector('.radio-fieldset').classList.remove('radio-erro');
  });
});

document.getElementById('formulario').addEventListener('submit', function (e) {
  e.preventDefault();
  if (validarFormulario()) {
    alert('Formulário enviado com sucesso! ✅');
    this.reset();
  } else {
    // Rola até o primeiro erro
    const primeiroErro = document.querySelector('.input-erro, .termos-erro');
    if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
