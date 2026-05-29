const submitBtn = document.querySelector('.btn-submit');

submitBtn.addEventListener('click', async () => {

  const data = {

    map: document.getElementById('mapName').value,

    stage: document.getElementById('stageName').value,

    penalty: {
      enabled: document.getElementById('penalty').checked,
      note: document.getElementById('penaltyNote').value
    },

    teams: []
  };

  const teamCards = document.querySelectorAll('.team-card');

  teamCards.forEach(card => {

    const survivors = [];

    card.querySelectorAll('.survivor-entry').forEach(entry => {

      survivors.push({
        name: entry.querySelector('.survivor-name').value,

        rescues: Number(
          entry.querySelector('.rescues').value
        ),

        generators: Number(
          entry.querySelector('.generators').value
        ),

        escaped: entry.querySelector('.escaped').checked
      });

    });

    data.teams.push({

      name: card.querySelector('.team-name').value,

      captain: card.querySelector('.captain').value,

      killer: {

        name: card.querySelector('.killer-select').value,

        kills: Number(
          card.querySelector('.killer-kills').value
        ),

        pressure: Number(
          card.querySelector('.killer-pressure').value
        )

      },

      survivors

    });

  });

  try {

    const response = await fetch('/api/save-match', {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(data)

    });

    const result = await response.json();

    if(result.success) {
      alert('Матч сохранён!');
    }

  } catch(error) {

    console.log(error);

    alert('Ошибка сервера');

  }

});