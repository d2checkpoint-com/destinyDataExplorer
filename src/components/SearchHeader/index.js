import React, { useState, useMemo } from "react";
import { keyBy, isArray } from "lodash";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { FILTERS } from "lib/search/guiSearchFilters";

import { setActiveLanguage as _setActiveLanguage } from "store/app";

import Modal from "components/Modal";
import Icon from "components/Icon";
import Filters from "components/Filters";
import sparkleEmoji from "./sparkleEmoji.png";

import s from "./styles.module.scss";
import logo from "./logo.svg";

const FILTERS_BY_ID = keyBy(FILTERS, "id");

const getPlaceholder = (defs, isReady) => {
  if (!defs) {
    return "Loading data...";
  }

  return isReady ? "Search by item name or hash" : "Loading search...";
};

function SearchHeader({
  onSearchChange,
  collectModeEnabled,
  toggleCollectMode,
  filterDrawerVisible,
  languages,
  setFilterValue,
  toggleFilterDrawer,
  setActiveLanguage,
  filters,
  searchString,
  activeLanguage,
  defs,
  searchIsReady,
}) {
  const [extraErCount, setExtraErCount] = useState(0);
  const extraEr = useMemo(
    () => new Array(extraErCount).fill("er").join(""),
    [extraErCount]
  );

  const handleErClick = () => setExtraErCount((v) => v + 1);

  const filterArr = Object.entries(filters)
    .map(([key, value]) => ({
      key,
      value,
    }))
    .filter((v) => v.value);

  return (
    <div className={s.root}>
      <div className={s.main}>
        <div className={s.logoish}>
          <img className={s.logo} src={logo} alt="" />

          <span onClick={handleErClick}>Data Explorer{extraEr}</span>
        </div>

        <div className={s.mainMain}>
          <input
            type="text"
            value={searchString || ""}
            placeholder={getPlaceholder(defs, searchIsReady)}
            className={s.searchField}
            onChange={onSearchChange}
            disabled={!defs}
          />

          {filterArr.map((filterOpt) => {
            const filterDef = FILTERS_BY_ID[filterOpt.key];

            if (!filterDef) {
              return null;
            }

            const values = isArray(filterOpt.value)
              ? filterOpt.value
              : [filterOpt.value];

            const texts = values.map((value) => {
              const valueLabel = filterDef
                .data(defs)
                .find((fdef) => value.value === fdef.value);

              return valueLabel.label;
            });

            return (
              <div className={s.appliedFilter} key={filterOpt.key}>
                {filterDef.label}: {texts.join(" & ")}
                <button
                  className={s.closeButton}
                  onClick={() => setFilterValue({ [filterOpt.key]: null })}
                >
                  <Icon name="times" />
                </button>
              </div>
            );
          })}
        </div>

        <div className={s.languageButton}>
          <div className={s.buttonInner}>{activeLanguage}</div>

          <select
            className={s.languageDropdown}
            onChange={(ev) => setActiveLanguage(ev.target.value)}
            value={activeLanguage}
          >
            {languages.map((lang) => (
              <option key={lang.identifier} value={lang.identifier}>
                {lang.displayName} ({lang.identifier})
              </option>
            ))}
          </select>
        </div>

        <button className={s.filterButton} onClick={toggleFilterDrawer}>
          <div className={s.buttonInner}>
            <Icon className={s.filterIcon} name="sliders-v" />
            Filters
          </div>
        </button>

        <Link to="/api" className={s.filterButton}>
          <div className={s.buttonInner}>
            <img src={sparkleEmoji} alt="" className={s.emojiImage} /> API
            Explorer
          </div>
        </Link>

        {/* <button
          className={collectModeEnabled ? s.bigButtonActive : s.bigButton}
          onClick={toggleCollectMode}
          title={
            collectModeEnabled ? "Disable collect mode" : "Enable collect mode"
          }
        >
          <div className={s.buttonInner}>
            <Icon name="plus" />
          </div>
        </button> */}
      </div>

      <Modal
        isOpen={filterDrawerVisible}
        onRequestClose={toggleFilterDrawer}
        closeTimeoutMS={200}
        className={{
          base: s.filterModalBase,
          afterOpen: s.filterModalAfterOpen,
          beforeClose: s.filterModalBeforeClose,
        }}
        overlayClassName={{
          base: s.filterModalOverlayBase,
          afterOpen: s.filterModalOverlayAfterOpen,
          beforeClose: s.filterModalOverlayBeforeClose,
        }}
      >
        <Filters
          className={s.filterDrawer}
          toggleFilterDrawer={toggleFilterDrawer}
        />
      </Modal>
    </div>
  );
}

const mapStateToProps = (state) => ({
  defs: state.definitions.definitions,
  filters: state.filter.filters,
  searchString: state.filter.searchString,
  languages:
    (state.app.bungieSettings && state.app.bungieSettings.userContentLocales) ||
    [],
  activeLanguage: state.app.activeLanguage,
});

export default connect(mapStateToProps, {
  setActiveLanguage: _setActiveLanguage,
})(SearchHeader);
