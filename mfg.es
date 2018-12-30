const { getStore } = window;

function formatShip(ship) {
  return {
    id: ship.api_id,
    shipId: ship.api_ship_id,
    lv: ship.api_lv,
    exp: ship.api_exp[0],
    nowhp: ship.api_nowhp,
    maxhp: ship.api_maxhp,
    slot: ship.api_slot,
    kyouka: ship.api_kyouka.slice(0, 5),
    back: ship.api_backs,
    fuel: ship.api_fuel,
    bull: ship.api_bull,
    dockTime: ship.api_ndock_time,
    cond: ship.api_cond,
    karyoku: ship.api_karyoku[0],
    raisou: ship.api_raisou[0],
    taiku: ship.api_taiku[0],
    soukou: ship.api_soukou[0],
    kaihi: ship.api_kaihi[0],
    taisen: ship.api_taisen[0],
    sakuteki: ship.api_sakuteki[0],
    lucky: ship.api_lucky[0],
    locked: !!ship.api_locked,
  };
}

export const parseMaterial = () => {
  const material = getStore('info.resources');
  return ['/post/v1/material', {
    fuel: material[0],
    ammo: material[1],
    steel: material[2],
    bauxite: material[3],
    instant: material[4],
    bucket: material[5],
    develop: material[6],
    revamping: material[7],
  }];
};
export const parseItem = () => {
  const items = getStore('info.equips');
  const newItems = [];
  for (const itemId in items) {
    const item = {
      id: items[itemId].api_id,
      slotitemId: items[itemId].api_slotitem_id,
      locked: !!items[itemId].api_locked,
      level: items[itemId].api_level,
    };
    if (items[itemId].api_alv) {
      item.alv = items[itemId].api_alv;
    }
    newItems.push(item);
  }
  return ['/post/v1/slotitem', newItems];
};
export const parseShip = () => {
  const ships = getStore('info.ships');
  const newShips = [];
  for (const shipId in ships) {
    newShips.push(formatShip(ships[shipId]));
  }
  return ['/post/v2/ship', newShips];
};
export const parseDeckport = () => {
  const fleets = getStore('info.fleets');
  const deck = [];
  for (const fleet of fleets) {
    const f = {
      id: fleet.api_id,
      name: fleet.api_name,
      ships: fleet.api_ship.filter(x => x !== -1),
    };
    if (fleet.api_id !== 1) {
      f.mission = {
        page: fleet.api_mission[0],
        number: fleet.api_mission[1],
        completeTime: fleet.api_mission[2],
      };
    }
    deck.push(f);
  }
  return ['/post/v1/deckport', deck];
};
export const parseBasic = () => {
  const basic = getStore('info.basic');
  return ['/post/v1/basic', {
    lv: basic.api_level,
    experience: basic.api_experience,
    rank: basic.api_rank,
    maxChara: basic.api_max_chara,
    fCoin: basic.api_fcoin,
    stWin: basic.api_st_win,
    stLose: basic.api_st_lose,
    msCount: basic.api_ms_count,
    msSuccess: basic.api_ms_success,
    ptWin: basic.api_pt_win,
    ptLose: basic.api_pt_lose,
    medals: basic.api_medals,
    comment: basic.api_comment,
    deckCount: basic.api_count_deck,
    kdockCount: basic.api_count_kdock,
    ndockCount: basic.api_count_ndock,
    largeDock: !!basic.api_large_dock,
  }];
};
export const parseNdock = () => {
  const ndock = getStore('info.repairs');
  return ['/post/v1/ndock', ndock.map(dock => ({
    id: dock.api_id,
    shipId: dock.api_ship_id,
    completeTime: dock.api_complete_time,
  }))];
};
export const parseMapinfo = () => {
  const mapInfo = getStore('info.maps');
  const newMapInfo = [];
  for (const mapIndex in mapInfo) {
    const map = {
      id: mapInfo[mapIndex].api_id,
      cleared: !!mapInfo[mapIndex].api_cleared,
      exbossFlag: !!mapInfo[mapIndex].api_exboss_flag
    };
    if (typeof mapInfo[mapIndex].api_defeat_count === 'number') {
      map.defeatedCount = mapInfo[mapIndex].api_defeat_count;
    }
    newMapInfo.push(map);
  }
  return ['/post/v1/mapinfo', newMapInfo];
};
export const parseMapStart = (mapStart) => {
  return ['/post/v1/map_start', {
    rashinFlag: !!mapStart.api_rashin_flg,
    rashinId: mapStart.api_rashin_id,
    mapAreaId: mapStart.api_maparea_id,
    mapInfoNo: mapStart.api_mapinfo_no,
    no: mapStart.api_no,
    eventId: mapStart.api_event_id,
    next: mapStart.api_next,
    bossCellNo: mapStart.api_bosscell_no,
    bossComp: !!mapStart.api_bosscomp
  }];
};
export const parseBattleResult = (battleResult, route) => {
  let getShip = [];
  if (battleResult.api_get_ship) {
    getShip = {
      id: battleResult.api_get_ship.api_ship_id,
      stype: battleResult.api_get_ship.api_ship_type,
      name: battleResult.api_get_ship.api_ship_name
    };
  }
  return ['/post/v1/battle_result', {
    _1: {
      enemies: battleResult.api_ship_id.filter(x => x !== -1),
      winRank: battleResult.api_win_rank,
      exp: battleResult.api_get_exp,
      mvp: battleResult.api_mvp,
      baseExp: battleResult.api_get_base_exp,
      shipExp: battleResult.api_get_ship_exp.filter(x => x !== -1),
      lostFlag: battleResult.api_lost_flag
        ? battleResult.api_lost_flag.filter(x => x !== -1).map(x => !!x)
        : [],
      questName: battleResult.api_quest_name,
      questLevel: battleResult.api_quest_level,
      enemyDeck: battleResult.api_enemy_info.api_deck_name,
      firstClear: !!battleResult.api_first_clear,
      getShip,
    },
    _2: route,
  }];
};
export const parseUpdateShip = shipData => [
  '/post/v1/update_ship',
  shipData.map(ship => formatShip(ship)),
];
export const parseMapRoute = (routeData, lastRoute) => {
  const fleet = getStore('info.fleets[0].api_ship').filter(x => x !== -1);
  return ['/post/v1/map_route', {
    areaId: routeData.api_maparea_id,
    infoNo: routeData.api_mapinfo_no,
    dep: lastRoute.no,
    dest: routeData.api_no,
    fleet,
  }];
};
export const parseQuestList = (quests) => {
  const questList = [];
  for (const quest of quests) {
    if (quest.api_no) {
      questList.push({
        no: quest.api_no,
        category: quest.api_category,
        typ: quest.api_type,
        state: quest.api_state,
        title: quest.api_title,
        detail: quest.api_detail,
        material: {
          fuel: quest.api_get_material[0],
          ammo: quest.api_get_material[1],
          steel: quest.api_get_material[2],
          bauxite: quest.api_get_material[3],
        },
        bonus: !!quest.api_bonus_flag,
        progressFlag: quest.api_progress_flag,
      });
    }
  }
  return ['/post/v1/questlist', questList];
};
export const parseCreateitem = (data, material) => {
  const flagShip = getStore('info.fleets[0].api_ship[0]');
  const create = {
    fuel: +material.api_item1,
    ammo: +material.api_item2,
    steel: +material.api_item3,
    bauxite: +material.api_item4,
    createFlag: !!data.api_create_flag,
    shizaiFlag: !!data.api_shizai_flag,
    flagship: flagShip,
  };
  if (create.createFlag) {
    create.id = data.api_slot_item.api_id;
    create.slotitemId = data.api_slot_item.api_slotitem_id;
  }
  return ['/post/v1/createitem', create];
};
export const parseDeleteKdock = (getShip, dock) => {
  return ['/post/v1/delete_kdock', {
    kDockId: +dock.api_kdock_id,
    shipId: getShip.api_ship_id,
  }];
};
export const parseKdock = (constructionData) => {
  const kdock = getStore('info.constructions');
  const kdockData = [];
  const kdockReq = [];
  const result = [];
  for (const _kdock of kdock) {
    kdockData.push({
      id: _kdock.api_id,
      shipId: _kdock.api_created_ship_id,
      state: _kdock.api_state,
      completeTime: _kdock.api_complete_time,
      fuel: _kdock.api_item1,
      ammo: _kdock.api_item2,
      steel: _kdock.api_item3,
      bauxite: _kdock.api_item4,
    });
    if (_kdock.api_state === 2) {
      kdockReq.push(kdockData[kdockData.length - 1]);
    }
  }

  if (constructionData) {
    const constructionTemp = Object.assign({}, constructionData);
    if (constructionTemp.createShip.highspeed) {
      constructionTemp.resultShip = kdockData[constructionTemp.createShip.kDock - 1].shipId;
      result.push(['/post/v2/createship', constructionTemp]);
    } else {
      constructionTemp.kDock = kdockData[constructionTemp.createShip.kDock - 1];
      result.push(['/post/v1/createship', constructionTemp]);
    }
  }

  result.push(['/post/v1/kdock', kdockReq]);
  return result;
};
export const parseRemodelSlot = (remodelSlotList) => {
  const remodelShip = getStore('info.fleets[0].api_ship[1]');
  const requestData = {
    second: remodelShip,
    list: [],
  };
  for (const remodelSlot of remodelSlotList) {
    requestData.list.push({
      id: remodelSlot.api_id,
      slotId: remodelSlot.api_slot_id,
      fuel: remodelSlot.api_req_fuel,
      ammo: remodelSlot.api_req_bull,
      steel: remodelSlot.api_req_steel,
      bauxite: remodelSlot.api_req_bauxite,
      develop: remodelSlot.api_req_buildkit,
      revamping: remodelSlot.api_req_remodelkit,
      reqSlotId: remodelSlot.api_req_slot_id,
      slotNum: remodelSlot.api_req_slot_num,
    });
  }
  return ['/post/v1/remodel_slot', requestData];
};
export const parseMasterRemodel = (remodelDetail, origin) => {
  const remodelShip = getStore('info.fleets[0].api_ship[1]');
  return ['/post/v1/master_remodel', {
    develop: remodelDetail.api_req_buildkit,
    remodel: remodelDetail.api_req_remodelkit,
    certainDevelop: remodelDetail.api_certain_buildkit,
    certainRemodel: remodelDetail.api_certain_remodelkit,
    slotitemId: remodelDetail.api_req_slot_id,
    slotitemNum: remodelDetail.api_req_slot_num,
    changeFlag: !!remodelDetail.api_change_flag,
    origSlotId: +origin.api_slot_id,
    secondShipId: remodelShip,
  }];
};
export const parseRemodel = (remodel, post) => {
  const remodelData = {
    flag: !!remodel.api_remodel_flag,
    beforeItemId: remodel.api_remodel_id[0],
    afterItemId: remodel.api_remodel_id[1],
    voiceId: remodel.api_voice_id,
    useSlotIds: remodel.api_use_slot_id,
    certain: !!+post.api_certain_flag,
    slotId: +post.api_slot_id,
  };
  if (remodel.api_after_slot) {
    remodelData.afterSlot = {
      id: remodel.api_after_slot.api_id,
      slotitemId: remodel.api_after_slot.api_slotitem_id,
      locked: !!remodel.api_after_slot.api_locked,
      level: remodel.api_after_slot.api_level,
    };
  }
  return ['/post/v1/remodel', remodelData];
};
export const parseBookShip = (booklist) => {
  const book = [];
  for (const ship of booklist.api_list) {
    if (ship.api_state[0][0] === 1) {
      book.push({
        id: ship.api_table_id[0],
        indexNo: ship.api_index_no,
        isDamaged: !!ship.api_state[0][1],
        name: ship.api_name,
        isMarried: !!ship.api_state[0][2],
      });
      if (ship.api_state[1] && ship.api_state[1][0] === 1) {
        book.push({
          id: ship.api_table_id[0],
          indexNo: ship.api_index_no + 100000,
          isDamaged: !!ship.api_state[1][1],
          name: `${ship.api_name}改`,
          isMarried: !!ship.api_state[1][2],
        });
      }
      if (ship.api_state[2] && ship.api_state[2][0] === 1) {
        book.push({
          id: ship.api_table_id[0],
          indexNo: ship.api_index_no + 200000,
          isDamaged: !!ship.api_state[2][1],
          name: `${ship.api_name}改二`,
          isMarried: !!ship.api_state[2][2],
        });
      }
    }
  }
  return ['/post/v1/book/ship', book];
};
export const parseBookItem = (itemlist) => {
  const book = [];
  for (const item of itemlist.api_list) {
    book.push({
      id: item.api_table_id[0],
      indexNo: item.api_index_no,
      name: item.api_name,
    });
  }
  return ['/post/v1/book/item', book];
};
