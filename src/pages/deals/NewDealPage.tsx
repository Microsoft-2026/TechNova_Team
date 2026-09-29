import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Briefcase, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { useCreateDeal } from '../../hooks/useIntelligenceApi';
import { DealStage, RiskLevel } from '../../types';

export const NewDealPage: React.FC = () => {
  const navigate = useNavigate();
  const createDealMutation = useCreateDeal();

  const [client, setClient] = useState('');
  const [industry, setIndustry] = useState('');
  const [value, setValue] = useState('');
  const [product, setProduct] = useState('');
  const [stage, setStage] = useState<DealStage>('QUALIFIED');
  const [owner, setOwner] = useState('');
  const [risk, setRisk] = useState<RiskLevel>('LOW');
  const [summary, setSummary] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!client.trim() || !product.trim() || !value) {
      setFormError('Client name, product, and estimated value are required.');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setFormError('Please enter a valid positive deal value.');
      return;
    }

    try {
      const created = await createDealMutation.mutateAsync({
        client: client.trim(),
        industry: industry.trim() || 'Enterprise Software',
        value: numValue,
        currency: 'INR',
        product: product.trim(),
        stage,
        owner: owner.trim() || 'Current User',
        risk,
        status: 'ACTIVE',
        summary: summary.trim(),
      });

      navigate(`/deals/${created.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create deal on backend.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/deals"
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-bold text-slate-100">Create New Deal</h1>
          <p className="text-xs text-slate-400">Initialize a deal in the intelligence layer</p>
        </div>
      </div>

      <Card className="p-6">
        {formError && (
          <div className="mb-5 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{formError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Client / Company Name *"
              placeholder="e.g. Acme Health Corp"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              required
            />
            <Input
              label="Industry"
              placeholder="e.g. Healthcare, FinTech, Logistics"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Deal Value (₹ INR) *"
              type="number"
              placeholder="150000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
            <Input
              label="Target Product / Package *"
              placeholder="e.g. Enterprise Intelligence Suite"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Initial Stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as DealStage)}
              options={[
                { value: 'LEAD', label: 'Lead' },
                { value: 'QUALIFIED', label: 'Qualified' },
                { value: 'DEMO', label: 'Demo' },
                { value: 'PROPOSAL', label: 'Proposal' },
                { value: 'NEGOTIATION', label: 'Negotiation' },
                { value: 'APPROVAL', label: 'Approval' },
              ]}
            />
            <Select
              label="Initial Risk Assessment"
              value={risk}
              onChange={(e) => setRisk(e.target.value as RiskLevel)}
              options={[
                { value: 'LOW', label: 'Low Risk' },
                { value: 'MEDIUM', label: 'Medium Risk' },
                { value: 'HIGH', label: 'High Risk' },
                { value: 'CRITICAL', label: 'Critical Risk' },
              ]}
            />
            <Input
              label="Deal Owner"
              placeholder="e.g. Sarah Chen"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>

          <Textarea
            label="Deal Context & Initial Objectives"
            placeholder="Key buyer motivations, technical evaluation scope, known deadlines..."
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/deals')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="intelligence"
              size="sm"
              isLoading={createDealMutation.isPending}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Create Deal Record
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
