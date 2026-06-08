import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { Cross2Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import './NavbarSidebar.css'; // Add the CSS below

interface NavbarSidebarProps {
    items: { href: string, children: React.ReactNode }[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function NavbarSidebar( { items, open, onOpenChange }: NavbarSidebarProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            {/* The Hamburger Button that triggers the menu */}
            <Dialog.Trigger asChild>
                <button className="IconButton TopRightTrigger" aria-label="Open menu">
                    <HamburgerMenuIcon />
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="DialogOverlay" />
                <Dialog.Content className="DialogContent">
                    <div className="DialogHeader">
                        <Dialog.Title className="DialogTitle">Menu</Dialog.Title>
                        <Dialog.Close asChild>
                            <button className="IconButton" aria-label="Close">
                                <Cross2Icon />
                            </button>
                        </Dialog.Close>
                    </div>

                    {/* Your Navigation Links */}
                    <nav className="NavList">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="w-full text-left p-4 hover:bg-gray-300 hover:text-white flex items-center text-base font-medium"
                                onClick={() => onOpenChange(false)}
                            >
                                {item.children}
                            </Link>
                        ))}
                    </nav>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
