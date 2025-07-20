import TicketList from '../components/TicketList';
import { SupportTicket } from '@/types/support';

const OnboardingTicketHistory = () => {
  const handleTicketSelect = (ticket: SupportTicket) => {
    console.log('Selected ticket:', ticket);
  };

  return <TicketList onTicketSelect={handleTicketSelect} />;
};

export default OnboardingTicketHistory; 