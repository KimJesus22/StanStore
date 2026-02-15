import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthModal from './AuthModal';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';

// Mock dependencies
vi.mock('@/lib/supabaseClient');
vi.mock('react-hot-toast');
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}));

// Mock Zustand store
const mockCloseAuthModal = vi.fn();
vi.mock('@/store/useAuthStore', () => ({
    useAuthStore: () => ({
        isAuthModalOpen: true,
        closeAuthModal: mockCloseAuthModal,
    }),
}));

// Helper to render with ThemeProvider
const renderWithTheme = (component: React.ReactNode) => {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
};

describe('AuthModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        renderWithTheme(<AuthModal />);

        expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
    });

    it('allows user to type in inputs', () => {
        renderWithTheme(<AuthModal />);

        const emailInput = screen.getByPlaceholderText('Correo electrónico');
        const passwordInput = screen.getByPlaceholderText('Contraseña');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('calls signInWithPassword on form submit with correct credentials', async () => {
        // Mock successful response
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            data: { user: { id: '123' } },
            error: null,
        });

        renderWithTheme(<AuthModal />);

        fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'password123' } });

        const submitButton = screen.getByRole('button', { name: /entrar/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });
    });

    it('shows error toast on login failure', async () => {
        // Mock error response
        const errorMessage = 'Invalid login credentials';
        (supabase.auth.signInWithPassword as any).mockResolvedValue({
            data: { user: null },
            error: new Error(errorMessage),
        });

        renderWithTheme(<AuthModal />);

        fireEvent.change(screen.getByPlaceholderText('Correo electrónico'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'wrongpass' } });

        fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(errorMessage);
        });
    });
});
