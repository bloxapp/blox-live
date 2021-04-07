import React, { useCallback, useEffect, useState } from 'react';
import { Motion, spring } from 'react-motion';
import { DropDown } from '~app/common/components';

const useContextMenu = () => {
  const [xPos, setXPos] = useState('0px');
  const [yPos, setYPos] = useState('0px');
  const [showMenu, setShowMenu] = useState(false);
  const [event, setEvent] = useState(null);
  const [text, setText] = useState('');

  const handleContextMenu = useCallback(
    (e) => {
      e.preventDefault();
      setText(window.getSelection().toString().trim());
      setEvent(e);
      setXPos(`${e.pageX}px`);
      setYPos(`${e.pageY}px`);
      setShowMenu(true);
    },
    [setXPos, setYPos]
  );

  const handleClick = useCallback(() => {
    showMenu && setShowMenu(false);
  }, [showMenu]);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.addEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  });

  return { xPos, yPos, showMenu, event, text };
};

type ContextMenuProps = {
  menu: any
};

export const ContextMenu = (props: ContextMenuProps) => {
  const { xPos, yPos, showMenu, event, text } = useContextMenu();
  const { menu } = props;
  const MenuComponent = menu(event, text);
  return (
    <Motion
      defaultStyle={{ opacity: 0 }}
      style={{ opacity: !showMenu ? spring(0) : spring(1) }}
    >
      {(interpolatedStyle) => (
        <>
          {showMenu ? (
            <div
              className="menu-container"
              style={{
                position: 'absolute',
                top: yPos,
                left: xPos,
                opacity: interpolatedStyle.opacity,
                zIndex: 1000
              }}
            >
              {MenuComponent}
            </div>
          ) : (
            <></>
          )}
        </>
      )}
    </Motion>
  );
};

type SelectionContextMenuProps = {
  text: string,
  event: any
};

export const SelectionContextMenu = (props: SelectionContextMenuProps) => {
  const { event, text } = props;

  const triggerChangeEvent = (e, newValue) => {
    e.target.value = newValue;
    e.target.dispatchEvent(new Event('paste', { bubbles: true}));
    e.target.dispatchEvent(new Event('change', { bubbles: true}));
    e.target.focus();
    e.target.blur();
    e.target.focus();
  };

  const copyMenuItem = {
    name: 'Copy',
    onClick: () => {
      return navigator.clipboard.writeText(text);
    },
    color: false
  };

  const cutMenuItem = {
    name: 'Cut',
    onClick: () => {
      navigator.clipboard.writeText(text).then(() => {
        let newValue = '';
        if (event.target?.value) {
          newValue = String(event.target?.value).replace(text, '');
        }
        triggerChangeEvent(event, newValue);
      });
    },
    color: false
  };

  const pasteMenuItem = {
    name: 'Paste',
    onClick: () => {
      navigator.clipboard.readText().then((clipText) => {
        triggerChangeEvent(event, clipText);
      });
    },
    color: false
  };

  const menuItems = [];

  if (text) {
    menuItems.push(copyMenuItem);
    if (['textarea', 'password', 'text'].indexOf(event.target.type) !== -1) {
      menuItems.push(cutMenuItem);
    }
  }
  if (['textarea', 'password', 'text'].indexOf(event.target.type) !== -1) {
    menuItems.push(pasteMenuItem);
  }

  if (!menuItems.length) {
    return null;
  }

  return <DropDown items={menuItems} style={{ width: 150 }} />;
};
