const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
const COLOR_ATTENTION = '#fc036f';
const COLOR_SUCCESS = '#4ee846';

function simulateMouseClick(element) {
  mouseClickEvents.forEach(mouseEventType =>
      element.dispatchEvent(
        new MouseEvent(mouseEventType, {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1
        })
      )
    );
}

function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    valueSetter.call(element, value);
  }
}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function randomBetween(min, max) {
    return min + Math.round(Math.random() * (max - min));
}

function sleep(ms) {
  console.log('Sleeping for', ms, 'ms...')
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function goToAccount($, account) {
  const searchButton = ".cTBqC"
  if ($(searchButton) == null) {
    console.error(`Search button '${searchButton}' not found. Make sure the search results menu is closed.`);
    return false;
  }

  // Click on the search button to open the search results menu.
  simulateMouseClick($(searchButton));
  console.log(`%cSearch button '${searchButton}' clicked!`, `color: ${COLOR_SUCCESS}`);

  // Simulate typing the search query
  const searchInput = ".XTCLo.d_djL.DljaH"
  simulateMouseClick($(searchInput));
  setNativeValue($(searchInput), account);
  $(searchInput).dispatchEvent(new Event('input', { bubbles: true }));
  console.log(`%cSearch query '${account}' entered!`, `color: ${COLOR_SUCCESS}`);

  const firstSearchRow = ".fuqBx div:nth-child(1) a"
  // Wait for the search results...
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(randomBetween(500, 1000));
    if ($(firstSearchRow)) {
      break;
    }
  }

  const link = $(firstSearchRow);
  if (!link) {
    console.error(`Couldn't find search results. Make sure to return the focus to the page after kicking off the script. Or, try increasing the timeout above in case the search is slow.`)
    return false;
  }

  link.click()

  console.log(`%cLink to account '${link}' clicked`, `color: ${COLOR_SUCCESS}`);
  return true;
}

async function click($, i, btns) {
    var sleepMs = randomBetween(1500, 2500);
    if (i + 1 == btns.length) {
        // wait longer before closing the dialog
        console.log("...wait more...");
        await sleep(randomBetween(2000, 3000));
    }

    var btn = btns[i];

    if ($(btn) == null) {
        console.log("button #"+i+": '"+btn+"' not found");
        return
    }

    $(btn).click();
    console.log("button #" + i + ": '" + btn + "' clicked");

    if (i+1 == btns.length) {
        console.log("account reported. Glory to Ukraine!");
        return
    }

    if (i + 1 < btns.length) {
        await sleep(sleepMs);
        await click($, i + 1, btns);
    }
}

async function reportAccount($) {
    console.log("start reporting");
    await click($, 0, [
        ".VMs3J .wpO6b",
        ".mt3GC button:nth-child(3)",
        ".J09pf button:nth-child(2)",
        ".J09pf button:nth-child(1)",
        ".J09pf button:nth-child(7)",
        "#igCoreRadioButtontag-3",
        "._1XyCr .sqdOP.L3NKy.y3zKF",
        "._1XyCr .sqdOP.L3NKy.y3zKF"
    ]);
}

// Kick off the script!
(async ($) => {
  console.log('%cIMPORTANT! Move focus from Dev Tools back to the page!', `color: ${COLOR_ATTENTION}`)
  // Wait for the user to switch the focus back to the page.
  await sleep(4000);

  shuffle(accounts);
  console.log(accounts);

  var failedAccountes = []
  for (let account of accounts) {
    try {
      var reported = localStorage.getItem(account);
      if (reported) {
        console.log("skip: account '" + account + "' already reported");
        continue
      }

      await sleep(randomBetween(1000, 2000));
      var success = await goToAccount($, account);
      if (!success) {
        failedAccountes.push(account);
        continue;
      }

      await sleep(randomBetween(1500, 3000));

      // Wait for the page to load
      while (!document || document.readyState !== "complete") {
        console.log("...wait...")
        await sleep(randomBetween(100, 1000));
      }

      await sleep(randomBetween(1500, 3000));
      // Call a function to report the account.
      await reportAccount($);

      localStorage.setItem(account, true);
    }
    catch (err) {
      console.error("failed to report '" + account + "' Error: "+err)
    }
  }
  console.log("FINISHED");
  
  if (failedAccountes.length > 0) {
      console.log("Failed accounts: " + failedAccountes)
  }
})($)

const accounts = [
    // "elenakrait",
    // "vrsoloviev",
    // "marton1881",
    // "kdvinsky",
    // "_m_simonyan_",
    // "juliakovalchuk",
    // "tv3russia",
    // "tnt_online",
    "starovoytov82",
    // "oleggazmanov",
    // "lider95",
    "russia_fsb_sf",
    "e.uglach",
    "katiatxi",
    "Missalena.92",
    "alina.life.vlog",
    "zhest_belgorod",
]
