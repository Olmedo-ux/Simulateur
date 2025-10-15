let lignes = [];
let lignesCad = [];

function fraisBarème(montantTotal) {
  if (montantTotal < 10_000_000) return 27500;
  if (montantTotal < 50_000_000) return 37500;
  return 55000;
}

function fraisCapacite(montant) {
  if (montant === 0) return 27500;
  if (montant > 0 && montant < 10_000_000) return 33000;
  if (montant >= 10_000_000 && montant < 50_000_000) return 55000;
  if (montant >= 50_000_000 && montant < 200_000_000) return 110000;
  if (montant >= 200_000_000) return 275000;
  return 0;
}

function fraisGarantieGlobale(lignesGarantie) {
  const montantTotal = lignesGarantie.reduce((acc, l) => acc + l.montant * l.nombre, 0);
  const nbTotal = lignesGarantie.reduce((acc, l) => acc + l.nombre, 0);
  if (montantTotal === 0) return { frais: 0, detail: '' };
  if (nbTotal === 1 && montantTotal <= 2_000_000) {
    return {
      frais: 93800,
      detail: `Garantie de soumission unique ≤ 2 000 000 FCFA\nNombre de garantie : 1\nFrais fixes : 93 800 FCFA`
    };
  }
  const barème = fraisBarème(montantTotal);
  const frais = ((montantTotal * 0.03 / 4) * 1.1 * 2) + barème + (30000 * nbTotal);
  return {
    frais,
    detail: `Somme des garanties de soumission : ${montantTotal.toLocaleString()} FCFA\n` +
            `Nombre total de garanties : ${nbTotal}\n` +
            `Frais Barème : ${barème.toLocaleString()} FCFA\n` +
            `Formule appliquée : ((${montantTotal.toLocaleString()} × 3%) ÷ 4) × 1.1 × 2 + ${barème.toLocaleString()} + 30 000 × ${nbTotal}\n` +
            `Frais total : ${frais.toLocaleString()} FCFA`
  };
}

function fraisCadElement(montant, nombre) {
  if (montant <= 2_000_000) {
    return {
      frais: 93800 * nombre,
      detail: `Élément CAD/CBE/CRG ≤ 2 000 000 FCFA\nNombre : ${nombre}\nFrais fixes par élément : 93 800 FCFA\nFrais total : ${(93800 * nombre).toLocaleString()} FCFA`
    };
  }
  const barème = fraisBarème(montant);
  const frais = ((montant * 0.03 / 4) * 1.1 * 2) + barème + (30000 * nombre);
  return {
    frais,
    detail: `Montant : ${montant.toLocaleString()} FCFA\nNombre : ${nombre}\nFrais Barème : ${barème.toLocaleString()} FCFA\nFormule : ((Montant × 3%) ÷ 4) × 1.1 × 2 + Frais Barème + 30 000 × Nombre\nFrais total : ${frais.toLocaleString()} FCFA`
  };
}

function ajouterLigne() {
  const type = document.getElementById('typeInput').value;
  const montant = parseFloat(document.getElementById('montantInput').value);
  const nombre = parseInt(document.getElementById('nombreInput').value);
  const errorMessage = document.getElementById('errorInput');
  errorMessage.textContent = '';
  if (!type) {
    errorMessage.textContent = "Veuillez sélectionner un type d'élément.";
    return;
  }
  if (isNaN(montant) || montant < 0) {
    errorMessage.textContent = "Veuillez entrer un montant valide (≥ 0).";
    return;
  }
  if (isNaN(nombre) || nombre < 1) {
    errorMessage.textContent = "Le nombre d'éléments doit être au moins 1.";
    return;
  }
  for (let i = 0; i < nombre; i++) {
    lignes.push({
      id: Date.now() + Math.random(),
      type,
      montant,
      nombre: 1
    });
  }
  afficherTable();
  afficherDetailsComplets();
}

function afficherTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  lignes.forEach(ligne => {
    const typeAbbr = ligne.type === 'capacite' ? 'CF' : 'GS';
    const frais = ligne.type === 'capacite' ? fraisCapacite(ligne.montant) : '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Type">${typeAbbr}</td>
      <td data-label="Montant">${ligne.montant.toLocaleString()}</td>
      <td data-label="Nombre">${ligne.nombre}</td>
      <td data-label="Frais">${ligne.type === 'capacite' ? frais.toLocaleString() : '-'}</td>
      <td data-label="Supprimer"><button aria-label="Supprimer ligne" class="btn-suppr" data-id="${ligne.id}">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  const { fraisCapaciteTotal, fraisGarantieTotal } = calculerFrais();
  document.getElementById('totalFees').textContent = (fraisCapaciteTotal + fraisGarantieTotal).toLocaleString();

  tbody.querySelectorAll('.btn-suppr').forEach(btn => {
    btn.onclick = () => supprimerLigne(Number(btn.getAttribute('data-id')));
  });
}


function ajouterLigneCad() {
  const type = document.getElementById('typeInputCad').value;
  const montant = parseFloat(document.getElementById('montantInputCad').value);
  const nombre = parseInt(document.getElementById('nombreInputCad').value);
  const errorMessage = document.getElementById('errorInputCad');
  errorMessage.textContent = '';
  if (!type) {
    errorMessage.textContent = "Veuillez sélectionner un type d'élément CAD / CBE / CRG.";
    return;
  }
  if (isNaN(montant) || montant < 0) {
    errorMessage.textContent = "Veuillez entrer un montant valide (≥ 0).";
    return;
  }
  if (isNaN(nombre) || nombre < 1) {
    errorMessage.textContent = "Le nombre d'éléments doit être au moins 1.";
    return;
  }
  for (let i = 0; i < nombre; i++) {
    lignesCad.push({
      id: Date.now() + Math.random(),
      type,
      montant,
      nombre: 1
    });
  }
  afficherTableCad();
  afficherDetailsComplets();
}

function afficherTableCad() {
  const tbody = document.getElementById('tableBodyCad');
  tbody.innerHTML = '';
  lignesCad.forEach(ligne => {
    const tr = document.createElement('tr');
    const typeLib = ligne.type.toUpperCase();
    const frais = fraisCadElement(ligne.montant, ligne.nombre).frais;
    tr.innerHTML = `
      <td>${typeLib}</td>
      <td>${ligne.montant.toLocaleString()}</td>
      <td>${ligne.nombre}</td>
      <td>${frais.toLocaleString()}</td>
      <td><button aria-label="Supprimer ligne CAD" class="btn-suppr-cad" data-id="${ligne.id}">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  const total = lignesCad.reduce((acc, l) => acc + fraisCadElement(l.montant, l.nombre).frais, 0);
  document.getElementById('totalFeesCad').textContent = total.toLocaleString();

  tbody.querySelectorAll('.btn-suppr-cad').forEach(btn => {
    btn.onclick = () => supprimerLigneCad(Number(btn.getAttribute('data-id')));
  });
}

function calculerFrais() {
  const fraisCapaciteTotal = lignes.filter(l => l.type === 'capacite')
    .reduce((acc, l) => acc + fraisCapacite(l.montant), 0);
  const garantiesLignes = lignes.filter(l => l.type === 'garantiesoumission');
  const {
    frais: fraisGarantieTotal
  } = fraisGarantieGlobale(garantiesLignes);
  return {
    fraisCapaciteTotal,
    fraisGarantieTotal
  };
}

function afficherDetailsComplets() {
  const detailsDiv = document.getElementById('detailsArea');
  const garantiesLignes = lignes.filter(l => l.type === 'garantiesoumission');
  const capacitesLignes = lignes.filter(l => l.type === 'capacite');
  const cadsLignes = lignesCad;

  const sections = [];

  if (garantiesLignes.length > 0) {
    const {
      detail: detailGarantie
    } = fraisGarantieGlobale(garantiesLignes);
    sections.push(`--- Détails des garanties de soumission ---\n\n${detailGarantie}`);
  }

  if (capacitesLignes.length > 0) {
    let detailCapacites = 'Détails des capacités financières :\n\n';
    capacitesLignes.forEach((l, idx) => {
      const f = fraisCapacite(l.montant);
      detailCapacites += `- Capacité n°${idx + 1}: Montant ${l.montant.toLocaleString()} FCFA → Frais ${f.toLocaleString()} FCFA\n`;
    });
    detailCapacites += `\nTotal frais capacités : ${capacitesLignes.reduce((acc, l) => acc + fraisCapacite(l.montant), 0).toLocaleString()} FCFA`;
    sections.push(detailCapacites);
  }

  if (cadsLignes.length > 0) {
    let detailCads = 'Détails des éléments CAD / CBE / CRG :\n\n';
    cadsLignes.forEach((l, idx) => {
      const {
        detail
      } = fraisCadElement(l.montant, l.nombre);
      detailCads += `- Élément n°${idx + 1}: Type ${l.type.toUpperCase()}\n${detail}\n\n`;
    });
    const totalCads = cadsLignes.reduce((acc, l) => acc + fraisCadElement(l.montant, l.nombre).frais, 0);
    detailCads += `Total frais CAD/CBE/CRG : ${totalCads.toLocaleString()} FCFA`;
    sections.push(detailCads);
  }

  detailsDiv.textContent = sections.length === 0 ? "Aucun élément ajouté." : sections.join("\n\n");
}

function supprimerLigne(id) {
  lignes = lignes.filter(l => l.id !== id);
  afficherTable();
  afficherDetailsComplets();
}

function supprimerLigneCad(id) {
  lignesCad = lignesCad.filter(l => l.id !== id);
  afficherTableCad();
  afficherDetailsComplets();
}

document.getElementById('inputForm').addEventListener('submit', event => {
  event.preventDefault();
  ajouterLigne();
});

document.getElementById('inputFormCad').addEventListener('submit', event => {
  event.preventDefault();
  ajouterLigneCad();
});
function afficherTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = '';
  lignes.forEach(ligne => {
    const typeAbbr = ligne.type === 'capacite' ? 'CF' : 'GS';  // <-- Ici
    const frais = ligne.type === 'capacite' ? fraisCapacite(ligne.montant) : '-';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${typeAbbr}</td>
      <td>${ligne.montant.toLocaleString()}</td>
      <td>${ligne.nombre}</td>
      <td>${ligne.type === 'capacite' ? frais.toLocaleString() : '-'}</td>
      <td><button aria-label="Supprimer ligne" class="btn-suppr" data-id="${ligne.id}">✕</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Suite inchangée
  const { fraisCapaciteTotal, fraisGarantieTotal } = calculerFrais();
  document.getElementById('totalFees').textContent = (fraisCapaciteTotal + fraisGarantieTotal).toLocaleString();

  tbody.querySelectorAll('.btn-suppr').forEach(btn => {
    btn.onclick = () => supprimerLigne(Number(btn.getAttribute('data-id')));
  });
}
tr.innerHTML = `
  <td data-label="Type">${typeAbbr}</td>
  <td data-label="Montant">${ligne.montant.toLocaleString()}</td>
  <td data-label="Nombre">${ligne.nombre}</td>
  <td data-label="Frais calculés">${ligne.type === 'capacite' ? frais.toLocaleString() : '-'}</td>
  <td data-label="Supprimer"><button aria-label="Supprimer ligne" class="btn-suppr" data-id="${ligne.id}">✕</button></td>
`;
