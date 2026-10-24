import { useId, useRef, useState } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';

/**
 * Accessible popover menu. `children` is a render function receiving `close`.
 */
export default function Dropdown({ renderTrigger, children, align = 'right', className = '' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();

  useOnClickOutside(containerRef, () => setOpen(false), open);

  return (
    <div className={`dropdown ${className}`.trim()} ref={containerRef}>
      {renderTrigger({
        open,
        toggle: () => setOpen((value) => !value),
        close: () => setOpen(false),
        menuId,
      })}

      {open ? (
        <div className={`dropdown__menu dropdown__menu--${align}`} id={menuId} role="menu">
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}
