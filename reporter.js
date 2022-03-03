const COLOR_ATTENTION = '#fc036f';
const COLOR_SUCCESS = '#77d54c';
const ACCOUNTS_PER_RUN = 40;

function simulateMouseClick(element) {
  const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
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
  console.log(`Search button '${searchButton}' clicked!`);

  // Simulate typing the search query
  const searchInput = ".XTCLo.d_djL.DljaH"
  // simulateMouseClick($(searchInput));
  setNativeValue($(searchInput), account);
  $(searchInput).dispatchEvent(new Event('input', { bubbles: true }));
  console.log(`Search query '${account}' entered!`);

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

  console.log(`Link to account '${link}' clicked`);
  return true;
}

async function waitForElementToUpdate(el) {
  return new Promise((resolve, reject) => {
    const observer = new MutationObserver(() => {
      resolve();
      observer.disconnect();
    });
    observer.observe(el, { childList: true });
    // For safety, let's set a 10-second timeout if no update arrives.
    setTimeout(() => {
      reject("Didn't receive any DOM updates for ", el);
      observer.disconnect();
    }, 10000);
  })
}

async function hasChildNumber(selector, number) {
  const n = document.querySelectorAll(selector).length;;
  return n === number;
}

async function click($, account, i, btns) {
  await sleep(randomBetween(500, 1000));

  if (btns[i].skip) {
    if (btns[i].skip() === true) {
      console.log("SKIP step");
      await click($, account, i + 1, btns);
      return
    }
  }

  if (i + 1 === btns.length) {
    // wait longer before closing the dialog
    console.log("...wait more...");
    await sleep(randomBetween(1500, 2000));
  }

  const btn = btns[i].selector;
  for (let attempt = 0; attempt < 10; attempt++) {
    console.log(`Wait for #${i} '${btn}' to appear...`);
    await sleep(randomBetween(500, 1000));
    if ($(btn)) {
      break;
    }
  }

  if ($(btn) === null) {
    console.log("button #" + i + ": '" + btn + "' not found");
    return;
  }

  $(btn).click();
  console.log("button #" + i + ": '" + btn + "' clicked");
  if (btns[i].wait) {
    console.log("Waiting for DOM update...");
    await btns[i].wait()
    console.log("DOM Updated");
  }

  if (i + 1 === btns.length) {
    console.log(`%cAccount '${account}' reported! Glory to Ukraine!`, `color: ${COLOR_SUCCESS}`);
    return;
  }

  if (i + 1 < btns.length) {
    await click($, account, i + 1, btns);
  }
}

async function reportAccount($, account) {
  console.log("start reporting");
  await click($, account, 0, [
    { selector: ".VMs3J .wpO6b" },
    { selector: ".mt3GC button:nth-child(3)" },
    { selector: ".J09pf button:nth-child(2)", wait: async () => waitForElementToUpdate($(".J09pf")), skip: async () => !hasChildNumber(".J09pf button", 2) },
    { selector: ".J09pf button:nth-child(1)", wait: async () => waitForElementToUpdate($(".J09pf")) },
    { selector: ".J09pf button:nth-child(11)" },
    // { selector: "#igCoreRadioButtontag-3" },
    // { selector: "._1XyCr .sqdOP.L3NKy.y3zKF" },
    { selector: "._1XyCr .sqdOP.L3NKy.y3zKF" }
  ]);
}

// Kick off the script!
(async ($) => {
  for (let attempt = 0; attempt < 6; attempt++) {
    console.log('%cIMPORTANT! Please move focus from Dev Tools back to the page!', `color: ${COLOR_ATTENTION}`)
    // Wait for the user to switch the focus back to the page.
    await sleep(1000);
  }

  shuffle(accounts);
  console.log(`Accounts: ${accounts}`);

  const failedAccounts = [];
  var i = 0;
  for (let account of accounts) {
    try {
      const reported = localStorage.getItem(account);
      if (reported) {
        console.log("skip: account '" + account + "' already reported");
        continue
      }

      if (i >= ACCOUNTS_PER_RUN) {
        console.log("%cMax number of accounts per day reached. Please rerun this script tomorrow. We'll stop russian propoganda!", `color: ${COLOR_ATTENTION}`);
        break;
      }

      await sleep(randomBetween(1000, 2000));
      const success = await goToAccount($, account);
      if (!success) {
        failedAccounts.push(account);
        continue;
      }

      await sleep(randomBetween(500, 1000));

      // Wait for the page to load
      while (!document || document.readyState !== "complete") {
        console.log("...wait...")
        await sleep(randomBetween(100, 1000));
      }

      await sleep(randomBetween(1500, 3000));
      // Call a function to report the account.
      await reportAccount($, account);

      localStorage.setItem(account, true);
      i++;
    }
    catch (err) {
      console.error("failed to report '" + account + "' Error: " + err)
    }
  }
  console.log("FINISHED");

  if (failedAccounts.length > 0) {
    console.log("Failed accounts: " + failedAccounts)
  }
})($)

const accounts = [
  "craterimpact",
  "viktoriapresent",
  "ali_mma_don",
  "otryady_putina",
  "alina.life.vlog",
  "marivedler",
  "real_politics_rus",
  "news_blog_rus",
  "tabukh_urist",
  "maksim.p04",
  "kremle__bot",
  "_pavelkorolev_",
  "kosmos_mikhailovka",
  "d.amonov93",
  "snn5.3",
  "ulyena_vadikovna",
  "romario_spb_parfum",
  "odin.narod",
  "nastusha_red",
  "e.uglach",
  "semchenko7378",
  "rockinrolla808",
  "pewaeinely",
  "hardrock.reading",
  "ap.rf",
  "miss_kiss_ml",
  "kprf_rostov_sovetskiy",
  "dahagoroshek",
  "biblergram",
  "olya_torubar",
  "yush.o",
  "inc.lugansk",
  "talyjustmyphoto",
  "sedovan_leotard_embroidery",
  "evgeniye_bakulin",
  "russiazaputina",
  "kat_maret",
  "volrota",
  "presidentsha69",
  "od_dr",
  "mrespublika",
  "nikolaizubrilin3628",
  "aleksandr_sanakoev_26rus",
  "vladimir_zaigrin666",
  "thezamyatins",
  "myagkova_olga_y",
  "tsarkrest",
  "bondarenko.nikolay26",
  "mara.mounn",
  "marusia_biryukova",
  "astrolog_orlova",
  "trezvayarossiya",
  "stepan_akopyan_s",
  "imamat.dagestana",
  "radugada",
  "russia_fsb_sf",
  "marina.slovo",
  "yambinna",
  "voroshilov_dm",
  "djmegofficial",
  "konstantin_sarkisyan",
  "veronikaivaschenko",
  "cityspb",
  "korolev_official",
  "tory.teacher",
  "shuvalov_music",
  "egorovznaet",
  "butina_maria",
  "reporter_sladkov",
  "makslorann",
  "vmgere",
  "tv_dagestana",
  "evgeny.poddubny",
  "konstantin.daragan",
  "__miss__alena",
  "khver.27",
  "arhyz24",
  "Olgakurbatova7",
  "sever_elena",
  "svetlana___manina",
  "goblin_oper",
  "kak_zdorovo",
  "vn9090",
  "manucharov",
  "advokat_goncharov",
  "za_putina",
  "Maisto777",
  "ivan.utenkov.live",
  "laima_vaikule_official",
  "sledcom_rf",
  "chp_vladikavkaz",
  "mamashvetka2",
  "makeevan",
  "russian_kremlin",
  "vladimirvladimirov5807",
  "andreykovalev_russia",
  "b.korchevnikov",
  "djkatyaguseva",
  "katiatxi",
  "shalyapin_official",
  "zapashny.ru",
  "Olgaviya",
  "4ch_russia",
  "nosov_official",
  "kadyrov_ahmat",
  "adubrovskaya",
  "artem.dzyuba",
  "alexemelyanenko",
  "kremlin_russian",
  "tanya.butskaya",
  "dustumjr",
  "nastya_slava",
  "tina_kandelaki",
  "tatarkafm",
  "za_kra_cherhigov_95",
  "nikolaibaskov",
  "Missalena.92",
]
