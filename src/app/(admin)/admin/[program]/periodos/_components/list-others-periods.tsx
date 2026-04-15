import ItemPeriod from "./item-period";



function ListPeriodsContent() {
    return (
        <div className="w-full space-y-6">
            <ItemPeriod />
            <ItemPeriod />
            <ItemPeriod />
        </div>
    );
}

export default function ListOthersPeriods() {
    return (
        <div>
            <h1 className="font-bold text-2xl mb-6">
                Histórico de Períodos
            </h1>
            <ListPeriodsContent />
        </div>
    );
}
