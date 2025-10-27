// Frais Barème individuel suivant montant garantie
function fraisBarèmeGarantie(montant) {
  if (montant <= 10000000) return 27500;
  if (montant <= 50000000) return 37500;
  return 55000;
}

// Frais Barème capacités financières
function fraisBarèmeCapacite(montant) {
  if (montant === 0) return 27500;
  if (montant > 0 && montant <= 10000000) return 33000;
  if (montant > 10000000 && montant <= 50000000) return 55000;
  if (montant > 50000000 && montant <= 200000000) return 110000;
  return 275000;
}

// Frais Barème CAD/CBE/CRG
function fraisBarèmeCadCrgCbe(montant) {
  return montant * 0.0025;
}

// Calcul frais garanties de soumission (individuel + cumul)
function fraisGarantieGlobale(lignesGarantie) {
  if (lignesGarantie.length === 0) return { frais: 0, detail: '' };

  let totalFrais = 0;
  let detailTexte = '';
  const n = lignesGarantie.reduce((acc, l) => acc + l.nombre, 0);

  lignesGarantie.forEach((ligne, idx) => {
    for (let i = 0; i < ligne.nombre; i++) {
      const montant = ligne.montant;
      const baseFrais = ((montant * 0.03) / 4) * 1.1 * 2;
      const barème = fraisBarèmeGarantie(montant);
      const frais = baseFrais + barème;
      totalFrais += frais;
      detailTexte += `Garantie n°${idx + 1} montant ${montant.toLocaleString()} FCFA :\n` +
                     `Formule : (((${montant.toLocaleString()} × 3%) ÷ 4) × 1.1 × 2) + ${barème.toLocaleString()} = ${frais.toLocaleString()} FCFA\n\n`;
    }
  });

  totalFrais += 30000 * n;

  detailTexte += `Nombre total de garanties : ${n}\nFrais fixés à 30 000 FCFA × nombre : ${ (30000 * n).toLocaleString() } FCFA\n\n`;
  detailTexte += `Frais total : ${totalFrais.toLocaleString()} FCFA`;

  return {
    frais: totalFrais,
    detail: detailTexte
  };
}

// Calcul frais capacités financières (avec barème fixe)
function fraisCapacite(montant) {
  if (montant === 0) return 27500;
  if (montant > 0 && montant <= 10000000) return 33000;
  if (montant > 10000000 && montant <= 50000000) return 55000;
  if (montant > 50000000 && montant <= 200000000) return 110000;
  if (montant > 200000000) return 275000;
  return 0;
}

// Calcul frais CAD/CBE/CRG
function fraisCadElement(montant, nombre) {
  let fraisTotal = 0;
  let detailTexte = '';
  for(let i = 0; i < nombre; i++) {
    const barème = fraisBarèmeCadCrgCbe(montant);
    const frais = ((montant * 0.03) / 4) * 1.1 * 2 + barème + 30000;
    fraisTotal += frais;
    detailTexte += `Élément ${i+1} type CAD/CBE/CRG montant ${montant.toLocaleString()} FCFA\n` +
                   `Barème (0.25%) : ${barème.toLocaleString()} FCFA\n` +
                   `Formule : ((Montant × 3%) ÷ 4) × 1.1 × 2 + Barème + 30 000 = ${frais.toLocaleString()} FCFA\n\n`;
  }
  detailTexte += `Total frais : ${fraisTotal.toLocaleString()} FCFA`;
  return { frais: fraisTotal, detail: detailTexte };
}
