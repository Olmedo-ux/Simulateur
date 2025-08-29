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
  if (montantTotal <= 2_000_000) {
    return {
      frais: 93800 * nbTotal,
      detail: `Garanties de soumission totales ≤ 2 000 000 FCFA\nNombre total de garanties : ${nbTotal}\nFrais fixes par garantie : 93 800 FCFA\nFrais total : ${(93800 * nbTotal).toLocaleString()} FCFA`
    };
  }
  const barème = fraisBarème(montantTotal);
  const frais = ((montantTotal * 0.03 / 4) * 1.1 * 2) + barème + (30000 * nbTotal);
  return {
    frais,
    detail: `Somme des garanties de soumission : ${montantTotal.toLocaleString()} FCFA\nNombre total de garanties : ${nbTotal}\nFrais Barème : ${barème.toLocaleString()} FCFA\nFormule appliquée : ((Montant total × 3%) ÷ 4) × 1.1 × 2 + Frais Barème + 30 000 × ${nbTotal}\nFrais total : ${frais.toLocaleString()} FCFA`
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
  const type = document.getElementById('typeElement').value;
  const montant = parseFloat(document.getElementById('montant').value);
  const nombre = parseInt(document.getElementById('nombre').value);
  const errorMessage = document.getElementById('errorMessage');
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
    lignes.push({ id: Date.now() + i, type, montant, nombre: 1 });
  }
  afficherTable();
  afficherDetailsComplets();
}

function afficherTable() {
  const tbody = document.querySelector("#tableauFrais tbody");
  tbody.innerHTML = '';
  lignes.forEach(ligne => {
    const tr = document.createElement('tr');
    const typeLib = ligne.type === 'capacite' ? 'Capacité financière' : 'Garantie de soumission';
    const frais = ligne.type === 'capacite' ? fraisCapacite(ligne.montant) : '-';
    tr.innerHTML = `
      <td>${typeLib}</td>
      <td>${ligne.montant.toLocaleString()}</td>
      <td>${ligne.nombre}</td>
      <td>${ligne.type === 'capacite' ? frais.toLocaleString() : '-'}</td>
      <td><button aria-label="Supprimer ligne" class="btn-suppr" data-id="${ligne.id}">✕</button></td>
    `;
    tbody.appendChild(tr);
  });
  const { fraisCapaciteTotal, fraisGarantieTotal } = calculerFrais();
  document.getElementById('totalFrais').textContent = (fraisCapaciteTotal + fraisGarantieTotal).toLocaleString();

  // Attacher écouteurs suppression
  tbody.querySelectorAll('.btn-suppr').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = Number(btn.getAttribute('data-id'));
      supprimerLigne(id);
    });
  });
}

function ajouterLigneCad() {
  const type = document.getElementById('typeElementCad').value;
  const montant = parseFloat(document.getElementById('montantCad').value);
  const nombre = parseInt(document.getElementById('nombreCad').value);
  const errorMessage = document.getElementById('errorMessageCad');
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
    lignesCad.push({ id: Date.now() + i, type, montant, nombre: 1 });
  }
  afficherTableCad();
  afficherDetailsComplets();
}

function afficherTableCad() {
  const tbody = document.querySelector("#tableauCad tbody");
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
  document.getElementById('totalFraisCad').textContent = total.toLocaleString();

  // Attacher écouteurs suppression CAD
  tbody.querySelectorAll('.btn-suppr-cad').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = Number(btn.getAttribute('data-id'));
      supprimerLigneCad(id);
    });
  });
}

function calculerFrais() {
  let fraisCapaciteTotal = lignes
    .filter(l => l.type === 'capacite')
    .reduce((acc, l) => acc + fraisCapacite(l.montant), 0);
  let garantiesLignes = lignes.filter(l => l.type === 'garantiesoumission');
  let { frais: fraisGarantieTotal } = fraisGarantieGlobale(garantiesLignes);
  return { fraisCapaciteTotal, fraisGarantieTotal };
}

function afficherDetailsComplets() {
  const detailsDiv = document.getElementById('details');
  const garantiesLignes = lignes.filter(l => l.type === 'garantiesoumission');
  const capacitesLignes = lignes.filter(l => l.type === 'capacite');
  const cadsLignes = lignesCad;

  let sections = [];

  if (garantiesLignes.length > 0) {
    let { detail: detailGarantie } = fraisGarantieGlobale(garantiesLignes);
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
      const { detail } = fraisCadElement(l.montant, l.nombre);
      detailCads += `- Élément n°${idx + 1}: Type ${l.type.toUpperCase()}\n${detail}\n\n`;
    });
    const totalCads = cadsLignes.reduce((acc, l) => acc + fraisCadElement(l.montant, l.nombre).frais, 0);
    detailCads += `Total frais CAD/CBE/CRG : ${totalCads.toLocaleString()} FCFA`;
    sections.push(detailCads);
  }

  if (sections.length === 0) {
    detailsDiv.textContent = "Aucun élément ajouté.";
  } else {
    detailsDiv.textContent = sections.join("\n\n");
  }
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

// Événements

document.getElementById('btnAddLigne').addEventListener('click', ajouterLigne);
document.getElementById('btnAddLigneCad').addEventListener('click', ajouterLigneCad);
function fraisGarantieGlobale(lignesGarantie) {
  const montantTotal = lignesGarantie.reduce((acc, l) => acc + l.montant * l.nombre, 0);
  const nbTotal = lignesGarantie.reduce((acc, l) => acc + l.nombre, 0);
  if (montantTotal === 0) return { frais: 0, detail: '' };

  if (nbTotal === 1 && montantTotal <= 2_000_000) {
    // Cas 1 garantie ≤ 2M : frais fixes
    return {
      frais: 93800,
      detail: `Garantie de soumission unique ≤ 2 000 000 FCFA\nNombre de garantie : 1\nFrais fixes : 93 800 FCFA`
    };
  } 
  // Pour plusieurs garanties OU garantie unique > 2M, appliquer la formule globale
  const barème = fraisBarème(montantTotal);
  const frais = ((montantTotal * 0.03 / 4) * 1.1 * 2) + barème + (30000 * nbTotal);
  return {
    frais,
    detail: `Somme des garanties de soumission : ${montantTotal.toLocaleString()} FCFA\nNombre total de garanties : ${nbTotal}\nFrais Barème : ${barème.toLocaleString()} FCFA\nFormule appliquée : ((Montant total × 3%) ÷ 4) × 1.1 × 2 + Frais Barème + 30 000 × ${nbTotal}\nFrais total : ${frais.toLocaleString()} FCFA`
  };
}

